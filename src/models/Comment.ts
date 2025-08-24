import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  blog: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId; // For nested comments
}

const CommentSchema: Schema<IComment> = new Schema(
  {
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    blog: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
    parentComment: { type: Schema.Types.ObjectId, ref: "Comment" },
  },
  { timestamps: true }
);

const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment; 