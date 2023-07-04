export interface ConfigTable {
  blockIteration: number;
  sleepBetweenIteration: number;
  nbrOfThreads: number;
  paused: boolean;
  latestIndexedBlock: number;
  latestIndexedEventBlock: number;
}
