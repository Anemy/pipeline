import { v4 as uuidv4 } from 'uuid';

import Schema, { placeHolderSchema } from './schema';

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

  sampleDocumentsSchema: Schema = placeHolderSchema;

  constructor(stageType: STAGES) {
    this.type = stageType;
    this.id = uuidv4();
  }

  static getNiceStageNameForStageType(stageType: STAGES) {
    switch (stageType) {
      case STAGES.FILTER:
        return 'Filter';
      case STAGES.LIMIT:
        return 'Limit';
      case STAGES.PROJECT:
        return 'Project';
      default:
        return stageType;
    }
  }
}

export default Stage;
