import { User, Vendor, Evaluation, Discussion, Question } from '../types';

const STORAGE_KEYS = {
  USERS: 'sales_training_users',
  VENDORS: 'sales_training_vendors', 
  EVALUATIONS: 'sales_training_evaluations',
  DISCUSSIONS: 'sales_training_discussions',
  QUESTIONS: 'sales_training_questions',
  CURRENT_USER: 'sales_training_current_user'
};

class StorageService {
  private getItem<T>(key: string): T[] {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return [];
    }
  }

  private setItem<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  }

  // Users
  getUsers(): User[] {
    return this.getItem<User>(STORAGE_KEYS.USERS);
  }

  saveUsers(users: User[]): void {
    this.setItem(STORAGE_KEYS.USERS, users);
  }

  getCurrentUser(): User | null {
    try {
      const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  setCurrentUser(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  }

  // Vendors
  getVendors(): Vendor[] {
    return this.getItem<Vendor>(STORAGE_KEYS.VENDORS);
  }

  saveVendors(vendors: Vendor[]): void {
    this.setItem(STORAGE_KEYS.VENDORS, vendors);
  }

  addVendor(vendor: Vendor): void {
    const vendors = this.getVendors();
    vendors.push(vendor);
    this.saveVendors(vendors);
  }

  updateVendor(updatedVendor: Vendor): void {
    const vendors = this.getVendors();
    const index = vendors.findIndex(v => v.id === updatedVendor.id);
    if (index !== -1) {
      vendors[index] = updatedVendor;
      this.saveVendors(vendors);
    }
  }

  deleteVendor(vendorId: string): void {
    const vendors = this.getVendors().filter(v => v.id !== vendorId);
    this.saveVendors(vendors);
    
    // Also delete related evaluations, discussions, and questions
    this.deleteEvaluationsByVendor(vendorId);
    this.deleteDiscussionsByVendor(vendorId);
    this.deleteQuestionsByVendor(vendorId);
  }

  // Evaluations
  getEvaluations(): Evaluation[] {
    return this.getItem<Evaluation>(STORAGE_KEYS.EVALUATIONS);
  }

  saveEvaluations(evaluations: Evaluation[]): void {
    this.setItem(STORAGE_KEYS.EVALUATIONS, evaluations);
  }

  addEvaluation(evaluation: Evaluation): void {
    const evaluations = this.getEvaluations();
    evaluations.push(evaluation);
    this.saveEvaluations(evaluations);
  }

  updateEvaluation(updatedEvaluation: Evaluation): void {
    const evaluations = this.getEvaluations();
    const index = evaluations.findIndex(e => e.id === updatedEvaluation.id);
    if (index !== -1) {
      evaluations[index] = updatedEvaluation;
      this.saveEvaluations(evaluations);
    }
  }

  getEvaluationsByVendor(vendorId: string): Evaluation[] {
    return this.getEvaluations().filter(e => e.vendorId === vendorId);
  }

  getEvaluationsByEvaluator(evaluatorId: string): Evaluation[] {
    return this.getEvaluations().filter(e => e.evaluatorId === evaluatorId);
  }

  deleteEvaluationsByVendor(vendorId: string): void {
    const evaluations = this.getEvaluations().filter(e => e.vendorId !== vendorId);
    this.saveEvaluations(evaluations);
  }

  // Discussions
  getDiscussions(): Discussion[] {
    return this.getItem<Discussion>(STORAGE_KEYS.DISCUSSIONS);
  }

  saveDiscussions(discussions: Discussion[]): void {
    this.setItem(STORAGE_KEYS.DISCUSSIONS, discussions);
  }

  addDiscussion(discussion: Discussion): void {
    const discussions = this.getDiscussions();
    discussions.push(discussion);
    this.saveDiscussions(discussions);
  }

  getDiscussionsByVendor(vendorId: string): Discussion[] {
    return this.getDiscussions().filter(d => d.vendorId === vendorId);
  }

  deleteDiscussionsByVendor(vendorId: string): void {
    const discussions = this.getDiscussions().filter(d => d.vendorId !== vendorId);
    this.saveDiscussions(discussions);
  }

  // Questions
  getQuestions(): Question[] {
    return this.getItem<Question>(STORAGE_KEYS.QUESTIONS);
  }

  saveQuestions(questions: Question[]): void {
    this.setItem(STORAGE_KEYS.QUESTIONS, questions);
  }

  addQuestion(question: Question): void {
    const questions = this.getQuestions();
    questions.push(question);
    this.saveQuestions(questions);
  }

  updateQuestion(updatedQuestion: Question): void {
    const questions = this.getQuestions();
    const index = questions.findIndex(q => q.id === updatedQuestion.id);
    if (index !== -1) {
      questions[index] = updatedQuestion;
      this.saveQuestions(questions);
    }
  }

  getQuestionsByVendor(vendorId: string): Question[] {
    return this.getQuestions().filter(q => q.vendorId === vendorId);
  }

  deleteQuestionsByVendor(vendorId: string): void {
    const questions = this.getQuestions().filter(q => q.vendorId !== vendorId);
    this.saveQuestions(questions);
  }

  // Utility methods
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  exportData(): string {
    const data = {
      users: this.getUsers(),
      vendors: this.getVendors(),
      evaluations: this.getEvaluations(),
      discussions: this.getDiscussions(),
      questions: this.getQuestions()
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.users) this.saveUsers(data.users);
      if (data.vendors) this.saveVendors(data.vendors);
      if (data.evaluations) this.saveEvaluations(data.evaluations);
      if (data.discussions) this.saveDiscussions(data.discussions);
      if (data.questions) this.saveQuestions(data.questions);
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();