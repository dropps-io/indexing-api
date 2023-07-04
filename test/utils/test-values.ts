import { MethodInterfaceTable } from '../../src/libs/database/lukso-structure/entities/methodInterface.table';
import { CONTRACT_TYPE } from '../../src/models/enums';
import { MethodParameterTable } from '../../src/libs/database/lukso-structure/entities/methodParameter.table';
import { ERC725YSchemaTable } from '../../src/libs/database/lukso-structure/entities/erc725YSchema.table';
import { ContractInterfaceTable } from '../../src/libs/database/lukso-structure/entities/contractInterface.table';

export const ADDRESS1 = '0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab';
export const ADDRESS2 = '0xA8f668006AeD69BB42F0A4458ced8B2ab744bfb7';
export const ADDRESS3 = '0xab257eE1D2669BC37fDcFE90BCbB3D9663557a19';
export const ADDRESS4 = '0x78B33dBFE571319f29A390eeCaf14F503f78BC8E';

// 0x + keccak256({any value})
export const HASH1 = '0x5f00fc4780204bdf03778df2ffa69c4ab03bff0aa84ed56c8dc215ff83ec0f39';
export const HASH2 = '0xbecf0fccb9e2778cd8f9a27b2b4b6ff7047ad6e5e49f8c8dade166c75ec73646';
export const HASH3 = '0xbb2ee8fb5c4d5dd6d160424318832d0545c205fb6a76f01f21d35c9f82b0d083';
export const HASH4 = '0xfc674c9fa07ec9948eae45c6cd04fa0d27cb42b74c93e1425a0dec53e8af4caf';
export const HASH5 = '0xeda07ad59be0132713d831195124ef906c6f264668f6ff2a87dd692a23858ed2';
export const HASH6 = '0xcc6e14c1ab748cb788449b274081d390ef21a3e6ad16177ec8e16ad2a3a4b2d4';

export const URL1 = 'https://super.url';
export const URL2 = 'https://super2.url';
export const URL3 = 'https://super3.url';
export const URL4 = 'https://super4.url';

export const TEST_STRUCTURE_METHODS: {
  interface: MethodInterfaceTable;
  parameters: MethodParameterTable[];
}[] = [
  {
    interface: {
      id: '0x01c42bd7',
      hash: '0x01c42bd7e97a66166063b02fce6924e6656b6c2c61966630165095c4fb0b7b2f',
      name: 'ContractCreated',
      type: 'event',
    },
    parameters: [
      {
        methodId: '0x01c42bd7',
        name: 'operation',
        type: 'uint256',
        indexed: true,
        position: 0,
      },
      {
        methodId: '0x01c42bd7',
        name: 'contractAddress',
        type: 'address',
        indexed: true,
        position: 1,
      },
      {
        methodId: '0x01c42bd7',
        name: 'value',
        type: 'uint256',
        indexed: true,
        position: 2,
      },
    ],
  },
];

export const TEST_ERC725Y: {
  schema: ERC725YSchemaTable;
}[] = [
  {
    schema: {
      name: 'LSP4TokenName',
      key: '0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1',
      keyType: 'Singleton',
      valueType: 'string',
      valueContent: 'String',
    },
  },
];

export const TEST_CONTRACT_INTERFACE: ContractInterfaceTable[] = [
  {
    id: '0x9a3bfe88',
    code: 'LSP0',
    name: 'Universal Profile',
    version: '0.6',
    type: CONTRACT_TYPE.PROFILE,
  },
  {
    id: '0xeb6be62e',
    code: 'LSP0',
    name: 'Universal Profile',
    version: '0.7',
    type: CONTRACT_TYPE.PROFILE,
  },
  {
    id: '0x66767497',
    code: 'LSP0',
    name: 'Universal Profile',
    version: '0.8',
    type: CONTRACT_TYPE.PROFILE,
  },
  { id: '0xc403d48f', code: 'LSP6', name: 'Key Manager', version: '0.7', type: null },
  { id: '0xfb437414', code: 'LSP6', name: 'Key Manager', version: '0.8', type: null },
  {
    id: '0xe33f65c3',
    code: 'LSP7',
    name: 'Digital Asset',
    version: '0.6',
    type: CONTRACT_TYPE.ASSET,
  },
  {
    id: '0x5fcaac27',
    code: 'LSP7',
    name: 'Digital Asset',
    version: '0.7',
    type: CONTRACT_TYPE.ASSET,
  },
  {
    id: '0xda1f85e4',
    code: 'LSP7',
    name: 'Digital Asset',
    version: '0.8',
    type: CONTRACT_TYPE.ASSET,
  },
  {
    id: '0x49399145',
    code: 'LSP8',
    name: 'Identifiable Digital Asset',
    version: '0.7',
    type: CONTRACT_TYPE.COLLECTION,
  },
  {
    id: '0x622e7a01',
    code: 'LSP8',
    name: 'Identifiable Digital Asset',
    version: '0.8',
    type: CONTRACT_TYPE.COLLECTION,
  },
  { id: '0xfd4d5c50', code: 'LSP9', name: 'Vault', version: '0.7', type: null },
  { id: '0x7050cee9', code: 'LSP9', name: 'Vault', version: '0.8', type: null },
];
