import { v4 as uuidv4 } from 'uuid';

import Schema, { placeHolderSchema } from './schema';

export enum STAGES {
  FILTER = 'FILTER',
  TRANSFORM = 'TRANSFORM',
  AGGREGATE = 'AGGREGATE',
  DATA_SOURCE = 'DATA_SOURCE'
  // MATCH = 'MATCH',
  // LIMIT = 'LIMIT',
  // PROJECT = 'PROJECT',
  // UNSET = 'UNSET'
};

export const DATA_SERVICE_STAGE_INDEX = 0;
export const NO_ACTIVE_STAGE = -1;

export interface Stage {
  type: STAGES;
  typeName: string;

  // TODO: We can create different classes that extend this interface
  // with their own content definitions (certain stages have more defined syntax).
  // content: any;
  // geoLayers: any;
  id: string;


  errorLoadingSampleDocuments: string;
  hasLoadedSampleDocuments: boolean;
  isLoadingSampleDocuments: boolean;

  sampleDocuments: any[];

  errorAnalyzingDocumentsSchema: string;
  hasAnalyzedSchema: boolean;
  isAnalyszingSchema: boolean;

  documentsAreUpToDate: boolean;

  sampleDocumentsSchema: Schema;

  getPipelineFromStage: () => any[];
  copyStageItems: (stageToCopyFrom: Stage) => void
}

class BasicStage implements Stage {
  type: STAGES;
  typeName = ''; // Each stage should implement.

  id: string;

  errorLoadingSampleDocuments = '';
  hasLoadedSampleDocuments = false;
  isLoadingSampleDocuments = false;

  // Used when we quick create a stage and want to display
  // that the documents the user is seeing aren't representative of
  // what exists at that stage.
  documentsAreUpToDate = true;

  sampleDocuments: any[] = [];

  errorAnalyzingDocumentsSchema = '';
  hasAnalyzedSchema = false;
  isAnalyszingSchema = false;

  sampleDocumentsSchema: Schema = placeHolderSchema;

  constructor(stageType: STAGES) {
    this.type = stageType;
    this.id = uuidv4();
  }

  getPipelineFromStage = (): any[] => {
    return [];
  }

  // Copies details/sample docs from another stage.
  copyStageItems = (stageToCopyThingsFrom: Stage) => {
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

export class FilterStage extends BasicStage implements Stage {
  geoLayers: any = {};
  content: any = {}; // The filter. TODO: Better naming.

  constructor() {
    super(STAGES.FILTER);
  }

  getPipelineFromStage = () => {
    return [{
      $match: this.content
    }];
  };
}

export class TransformStage extends BasicStage implements Stage {
  hiddenFields: { [fieldPath: string]: boolean } = {};
  renamedFields: { [fieldPath: string]: string } = {};
  addedFields: { [fieldPath: string]: any } = {};

  constructor() {
    super(STAGES.TRANSFORM);
  }

  getPipelineFromStage = () => {
    const pipeline: any[] = [];

    const fieldsForProject: { [fieldPath: string]: string | number } = {};
    for (const renamedFieldPath of Object.keys(this.renamedFields)) {
      fieldsForProject[this.renamedFields[renamedFieldPath]] = `$${renamedFieldPath}`;
    }

    if (Object.keys(fieldsForProject).length > 0) {
      for (const field of this.sampleDocumentsSchema.fields) {
        if (!fieldsForProject[field.path]) {
          fieldsForProject[field.path] = 1;
        }
      }

      // Now we add all of the keys...
      pipeline.push({
        $project: fieldsForProject
      });
    }

    const fieldsForUnset: { [fieldPath: string]: boolean } = {};
    for (const renamedFieldPath of Object.keys(this.renamedFields)) {
      fieldsForUnset[renamedFieldPath] = true;
    }
    for (const hiddenFieldPath of Object.keys(this.hiddenFields)) {
      fieldsForUnset[hiddenFieldPath] = true;
    }

    if (Object.keys(fieldsForUnset).length > 0) {
      pipeline.push({
        $unset: Object.keys(fieldsForUnset)
      });
    }

    return pipeline;
  };
}

export class AggregateStage extends BasicStage implements Stage {
  constructor() {
    super(STAGES.AGGREGATE);
  }
}

export class DataSourceStage extends BasicStage {
  database: string;
  collection: string;

  constructor(databaseName: string, collectionName: string) {
    super(STAGES.DATA_SOURCE);

    this.database = databaseName;
    this.collection = collectionName;
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
    const newStages = stage.getPipelineFromStage();
    if (newStages && newStages.length > 0) {
      pipeline.push(...newStages);
    }
  }

  return pipeline;
};

export const getNewStageForStageType = (stageType: STAGES) => {
  switch (stageType) {
    case STAGES.TRANSFORM:
      return new TransformStage();
    case STAGES.AGGREGATE:
      return new AggregateStage();
    case STAGES.FILTER:
      return new FilterStage();
    default:
      // TODO: Error.
      return new BasicStage(stageType);
  }
};

// Adds a new stage of the type if we aren't already on that stage.
// Returns the new stage and the index of where we should be.
export const ensureWeAreOnValidStageForAction = (
  stageType: STAGES,
  stages: Stage[],
  activeStage: number
): {
  newStages: Stage[],
  newActiveStage: number
} => {
  let newActiveStage = activeStage;
  const newStages = [...stages];

  if (newStages[activeStage].type !== stageType || activeStage === DATA_SERVICE_STAGE_INDEX) {
    if (newStages[activeStage + 1] && newStages[activeStage + 1].type === stageType) {
      // When the next stage is the type we want
      // we can just jump to that one and update.
      newActiveStage = activeStage + 1;
    } else {
      // Create a new stage and set it as our active stage.
      const newStage = getNewStageForStageType(stageType);

      // Copy details/sample docs from current stage.
      newStage.copyStageItems(newStages[activeStage]);
      if (activeStage !== 0) {
        newStage.documentsAreUpToDate = false;
      }

      newStages.splice(newActiveStage + 1, 0, newStage);
      newActiveStage++;
    }
  }

  return {
    newActiveStage,
    newStages
  };
};

export const getNiceStageNameForStageType = (stageType: STAGES) => {
  switch (stageType) {
    case STAGES.TRANSFORM:
      return 'Transform';
    case STAGES.AGGREGATE:
      return 'Aggregate';
    case STAGES.FILTER:
      return 'Filter';
    case STAGES.DATA_SOURCE:
      return 'Data Source'
    default:
      return stageType;
  }
};

export const getDescriptionForStageType = (stageType: STAGES) => {
  switch (stageType) {
    case STAGES.TRANSFORM:
      return 'Shape documents in your pipeline into a form you can work with: rename fields, hide fields, etc.';
    case STAGES.AGGREGATE:
      return 'Group your documents together, build averages, count fields, and more.';
    case STAGES.FILTER:
      return 'Match certain documents in the pipeline, leaving only the documents you want to see.'
    case STAGES.DATA_SOURCE:
      return 'Pull more data into your pipeline.'
    default:
      return stageType;
  }
};

export default Stage;
