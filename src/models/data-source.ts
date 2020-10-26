
export class DataSource {
  database: string;
  collection: string;

  constructor(databaseName: string, collectionName: string) {
    this.database = databaseName;
    this.collection = collectionName;
  }
}

export default DataSource;
