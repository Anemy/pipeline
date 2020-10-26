import { v4 as uuidv4 } from 'uuid';

export enum STAGES {
  FILTER = 'FILTER',
  LIMIT = 'LIMIT',
  PROJECT = 'PROJECT'
}

export class Stage {
  type: STAGES;
  content: string = '';
  id: string;

  errorLoadingSampleDocuments = '';
  hasLoadedSampleDocuments = false;
  isLoadingSampleDocuments = false;

  sampleDocuments: any[] = [];

  errorAnalyzingDocumentsSchema = '';
  hasAnalyzedSchema = false;
  isAnalyszingSchema = false;

  sampleDocumentsSchema: any[] = [];

  constructor(stageType: STAGES) {
    this.type = stageType;
    this.id = uuidv4();
  }
}

export default Stage;
