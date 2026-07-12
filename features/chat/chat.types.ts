export interface FamilyMessage {
  id: string;
  senderId: string;
  text: string;
  sentAt: string;
  linkedTaskId?: string;
}
