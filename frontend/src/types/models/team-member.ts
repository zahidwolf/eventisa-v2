export interface TeamMember {
  _id: string;
  name: string;
  designation: string;
  description: string;
  imageUrl: string;
  imagePublicId?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMemberInput {
  name: string;
  designation: string;
  description: string;
  imageUrl: string;
  imagePublicId?: string;
  order?: number;
  isActive?: boolean;
}
