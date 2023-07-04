### [DB DIAGRAM](https://dbdiagram.io/) lukso-indexing-data schema
```
Table contract {
  address char(42) [pk]
  interfaceCode varchar
  type varchar
}

Table metadata {
  id number
  address char(42)
  tokenId_opt char(66)
  name varchar
  symbol varchar
  description varchar
  isNFT boolean
}

Ref: metadata.(address) - contract.(address)
Ref: metadata.(address,tokenId_opt) - contract_token.(address,tokenId)

Table metadata_image {
  metadataId number
  url varchar
  width smallint
  height smallint
  type varchar
  hash char(66)
}

Ref: metadata_image.(metadataId) > metadata.(id)

Table metadata_link {
  metadataId number
  title varchar
  url varchar
}

Ref: metadata_link.(metadataId) > metadata.id

Table metadata_tag {
  metadataId number
  title varchar
}

Ref: metadata_tag.(metadataId) > metadata.(id)

Table metadata_asset {
  metadataId number
  url varchar
  fileType varchar(10)
  hash char(66)
}

Ref: metadata_asset.(metadataId) > metadata.(id)

Table contract_token {
  id char(66) [pk]
  address char(42)
  index int
  tokenId char(66)
  decodedTokenId varchar(66)
  latestKnownOwner char(42)
}

Ref: contract_token.(address) > contract.(address)

Table token_holder {
  address char(42)
  tokenId_opt char(66)
  balanceInEth int
  balanceInWei varchar(78)
  holderSinceBlock int
}

Ref: token_holder.(address) - contract.(address)
Ref: token_holder.(address,tokenId_opt) - contract_token.(address,tokenId)


Table data_changed {
  address char(42)
  key char(66)
  value varchar
  blockNumber int
}

Ref: data_changed.(address) > contract.(address)

Table transaction {
  hash char(66) [pk]
	nonce int
	blockHash char(66)
	blockNumber int
	transactionIndex int
  methodId char(10)
  methodName varchar(40)
	from char(42)
	to char(42)
	value varchar
	gasPrice varchar
	gas int
}

Table transaction_input {
  transactionHash char(66) [pk]
	input varchar
}

Ref: transaction_input.transactionHash - transaction.hash

Table transaction_parameter {
  transactionHash char(66)
	value varchar
  name varchar
  type varchar
  position smallint
}

Ref: transaction_parameter.(transactionHash) > transaction.(hash)

Table wrapped_transaction {
  id integer [pk]
  parentTransactionHash char(66)
  parentId interger
  from char(42)
	to char(42)
	value varchar
  methodId char(10)
  methodName varchar(40)
}

Ref: wrapped_transaction.parentTransactionHash > transaction.hash
Ref: wrapped_transaction.parentId > wrapped_transaction.id

Table wrapped_transaction_input {
  wrappedTransactionId integer
  input varchar
}

Ref: wrapped_transaction_input.wrappedTransactionId - wrapped_transaction.id

Table wrapped_transaction_parameter {
  wrappedTransactionId integer
	value varchar
  name varchar
  type varchar
  position smallint
}

Ref: wrapped_transaction_parameter.wrappedTransactionId > wrapped_transaction.id

Table event {
  id char(66) [pk]
  blockNumber int
  transactionHash char(66)
  logIndex int
  address char(66)
  eventName varchar
  topic0 char(66)
  topic1 char(66)
  topic2 char(66)
  topic3 char(66)
  data varchar
}


Table event_parameter {
  eventId char(66)
	value varchar
  name varchar
  index smallint
  type varchar
}

Ref: event_parameter.(eventId) > event.(id)
```

