### [DB DIAGRAM](https://dbdiagram.io/) lukso-indexing-data schema
```
Table erc725y_schema {
  key char(66) [pk]
  name varchar
  keyType varchar
  valueType varchar
  valueContent varchar
}

Table contract_interface {
  id char(10) [pk]
  code varchar
  name varchar
  type varchar
}

Table method_interface {
  id char(10) [pk]
  hash char(66)
  name varchar
  type varchar
}

Table method_parameter {
  methodId char(10)
  name varchar
  type varchar
  indexed boolean
  position int
}

Ref: method_parameter.(methodId) > method_interface.(id)

Table config {
  blockIteration integer
  sleepBetweenIteration integer
  nbrOfThreads integer
  paused boolean
  latestIndexedBlock integer
}
```

