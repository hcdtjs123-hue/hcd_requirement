export type MasterDataType = 'pt' | 'department'

export interface MasterDataItem {
  id: string
  name: string
  description: string | null
  created_at: string | null
  updated_at: string | null
}

export interface MasterDataInput {
  name: string
  description?: string | null
}
