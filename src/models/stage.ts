import { v4 as uuidv4 } from 'uuid';

import Schema, { placeHolderSchema } from './schema';

export enum STAGES {
  MATCH = 'MATCH',
  LIMIT = 'LIMIT',
  PROJECT = 'PROJECT',
  UNSET = 'UNSET'
};

export class Stage {
  type: STAGES;
  // TODO: We can create different classes that extend this interface
  // with their own content definitions (certain stages have more defined syntax).
  content: any = {};
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

    // Set some defaults... TODO: Class for each stage.
    if (stageType === STAGES.LIMIT) {
      this.content = 5;
    }
  }

  static getNiceStageNameForStageType(stageType: STAGES) {
    switch (stageType) {
      case STAGES.MATCH:
        return 'Match';
      case STAGES.LIMIT:
        return 'Limit';
      case STAGES.PROJECT:
        return 'Project';
      case STAGES.UNSET:
        return 'Unset';
      default:
        return stageType;
    }
  }

  // Copies details/sample docs from another stage.
  copyStageItems(stageToCopyThingsFrom: Stage) {
    this.errorLoadingSampleDocuments = stageToCopyThingsFrom.errorLoadingSampleDocuments;
    this.hasLoadedSampleDocuments = stageToCopyThingsFrom.hasLoadedSampleDocuments;
    this.isLoadingSampleDocuments = stageToCopyThingsFrom.isLoadingSampleDocuments;
    this.sampleDocuments = stageToCopyThingsFrom.sampleDocuments;

    this.errorAnalyzingDocumentsSchema = stageToCopyThingsFrom.errorAnalyzingDocumentsSchema;
    this.hasAnalyzedSchema = stageToCopyThingsFrom.hasAnalyzedSchema;
    this.isAnalyszingSchema = stageToCopyThingsFrom.isAnalyszingSchema;
    this.sampleDocumentsSchema = stageToCopyThingsFrom.sampleDocumentsSchema;
  }
}

export const buildAggregationPipelineFromStages = (stages: Stage[], sampleCount: number) => {
  // TODO: Get some typing for this.
  const pipeline: any = [{
    $sample: {
      size: sampleCount
    }
  }];

  for (const stage of stages) {
    // TODO: Move this into the stages class and have the stage class be
    // an interface for all kind of stages.
    switch (stage.type) {
      case STAGES.MATCH:
        pipeline.push({
          $match: stage.content
        });
        break;
      case STAGES.LIMIT:
        pipeline.push({
          $limit: stage.content
        });
        break;
      case STAGES.PROJECT:
        pipeline.push({
          $project: stage.content
        });
        break;
      case STAGES.UNSET:
        pipeline.push({
          $unset: Object.keys(stage.content)
        });
        break;
      default:
        break;
    }
  }

  return pipeline;
};

export default Stage;
