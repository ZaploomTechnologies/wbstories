export interface LikeStatusDTO {
  totalLikes: number;
  clientLikeCount: number;
  capped: boolean;
  incremented?: boolean;
}
