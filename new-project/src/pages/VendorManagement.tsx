import React, { useState, useEffect } from 'react';
import { Vendor } from '../types';
import { storageService } from '../services/storage';

export function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const currentUser = storageService.getCurrentUser();

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = () => {
    setVendors(storageService.getVendors());
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Access Denied</h1>
        </div>
        <p>Only administrators can manage vendors.</p>
      </div>
    );
  }

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setShowForm(true);
  };

  const handleDelete = (vendor: Vendor) => {
    if (window.confirm(`Are you sure you want to delete ${vendor.name}? This will also delete all related evaluations.`)) {
      storageService.deleteVendor(vendor.id);
      loadVendors();
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingVendor(null);
    loadVendors();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingVendor(null);
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Vendor Management</h1>
          <button 
            onClick={() => setShowForm(true)} 
            className="btn btn-primary"
          >
            Add New Vendor
          </button>
        </div>

        {showForm && (
          <VendorForm
            vendor={editingVendor}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        )}

        {vendors.length === 0 ? (
          <div style={emptyStateStyle}>
            <p>No vendors have been added yet.</p>
            <button 
              onClick={() => setShowForm(true)} 
              className="btn btn-primary mt-4"
            >
              Add First Vendor
            </button>
          </div>
        ) : (
          <div style={vendorListStyle}>
            {vendors.map((vendor) => (
              <div key={vendor.id} style={vendorCardStyle}>
                <div style={vendorHeaderStyle}>
                  <div>
                    <h3 style={vendorNameStyle}>{vendor.name}</h3>
                    <p style={vendorContactStyle}>
                      {vendor.contactName} - {vendor.contactEmail}
                      {vendor.contactPhone && ` - ${vendor.contactPhone}`}
                    </p>
                  </div>
                  <div style={vendorActionsStyle}>
                    <button 
                      onClick={() => handleEdit(vendor)}
                      className="btn btn-secondary"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(vendor)}
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div style={vendorDetailsStyle}>
                  <div style={vendorMetaStyle}>
                    <span><strong>Proposal Date:</strong> {new Date(vendor.proposalDate).toLocaleDateString()}</span>
                    <span><strong>Added:</strong> {new Date(vendor.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div style={vendorDifferentiatorsStyle}>
                    <h4>Key Differentiators:</h4>
                    <p>{vendor.keyDifferentiators}</p>
                  </div>

                  {vendor.documents.length > 0 && (
                    <div style={vendorDocumentsStyle}>
                      <h4>Documents ({vendor.documents.length}):</h4>
                      <ul style={documentListStyle}>
                        {vendor.documents.map((doc) => (
                          <li key={doc.id} style={documentItemStyle}>
                            <span>{doc.name}</span>
                            <span style={documentMetaStyle}>
                              {(doc.size / 1024).toFixed(1)}KB - {new Date(doc.uploadedAt).toLocaleDateString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface VendorFormProps {
  vendor: Vendor | null;
  onSubmit: () => void;
  onCancel: () => void;
}

function VendorForm({ vendor, onSubmit, onCancel }: VendorFormProps) {
  const [formData, setFormData] = useState({
    name: vendor?.name || '',
    contactName: vendor?.contactName || '',
    contactEmail: vendor?.contactEmail || '',
    contactPhone: vendor?.contactPhone || '',
    proposalDate: vendor?.proposalDate || new Date().toISOString().split('T')[0],
    keyDifferentiators: vendor?.keyDifferentiators || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    const vendorData: Vendor = {
      id: vendor?.id || `vendor_${Date.now()}`,
      ...formData,
      documents: vendor?.documents || [],
      createdAt: vendor?.createdAt || now,
      updatedAt: now
    };

    if (vendor) {
      storageService.updateVendor(vendorData);
    } else {
      storageService.addVendor(vendorData);
    }

    onSubmit();
  };

  return (
    <div style={formOverlayStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={formTitleStyle}>
          {vendor ? 'Edit Vendor' : 'Add New Vendor'}
        </h2>

        <div className="form-group">
          <label className="form-label">Vendor Name *</label>
          <input
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">Contact Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.contactName}
              onChange={(e) => setFormData({...formData, contactName: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Email *</label>
            <input
              type="email"
              className="form-input"
              value={formData.contactEmail}
              onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            <input
              type="tel"
              className="form-input"
              value={formData.contactPhone}
              onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Proposal Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.proposalDate}
              onChange={(e) => setFormData({...formData, proposalDate: e.target.value})}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Key Differentiators</label>
          <textarea
            className="form-input form-textarea"
            value={formData.keyDifferentiators}
            onChange={(e) => setFormData({...formData, keyDifferentiators: e.target.value})}
            placeholder="What makes this vendor unique? Key features, methodologies, etc."
          />
        </div>

        <div style={formActionsStyle}>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {vendor ? 'Update Vendor' : 'Add Vendor'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Styles
const emptyStateStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '48px',
  color: '#718096'
};

const vendorListStyle: React.CSSProperties = {
  display: 'grid',
  gap: '20px'
};

const vendorCardStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '24px'
};

const vendorHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '16px'
};

const vendorNameStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#1a202c',
  margin: '0 0 4px 0'
};

const vendorContactStyle: React.CSSProperties = {
  color: '#718096',
  fontSize: '14px',
  margin: 0
};

const vendorActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px'
};

const vendorDetailsStyle: React.CSSProperties = {
  display: 'grid',
  gap: '16px'
};

const vendorMetaStyle: React.CSSProperties = {
  display: 'flex',
  gap: '24px',
  fontSize: '14px',
  color: '#4a5568'
};

const vendorDifferentiatorsStyle: React.CSSProperties = {
  
};

const vendorDocumentsStyle: React.CSSProperties = {
  
};

const documentListStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '8px 0 0 0'
};

const documentItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  borderBottom: '1px solid #e2e8f0'
};

const documentMetaStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#718096'
};

const formOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '24px'
};

const formStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '32px',
  maxWidth: '600px',
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto'
};

const formTitleStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#1a202c',
  margin: '0 0 24px 0'
};

const formActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  marginTop: '24px'
};