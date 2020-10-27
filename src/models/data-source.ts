import Stage, { STAGES } from "./stage";

export class DataSource extends Stage {
  database: string;
  collection: string;

  constructor(databaseName: string, collectionName: string) {
    super(STAGES.MATCH); // PLACEHOLDER.
    // Should be sample.

    this.database = databaseName;
    this.collection = collectionName;
  }
}

export default DataSource;
