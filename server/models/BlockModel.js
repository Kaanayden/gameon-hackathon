import mongoose from 'mongoose';

const BlockSchema = new mongoose.Schema({
    x: {
        type: Number,
        required: true,
    },
    y: {
        type: Number,
        required: true,
    },
    type: {
        type: Number,
        required: true,
    },
    direction: {
        type: Number,
        required: false,
    },
    storage: {
        type: Map,
        of: Number,
        required: false,
      },
}, { 
    _id: false 
});

BlockSchema.index({ x: 1, y: 1 }, { unique: true });

const BlockModel = mongoose.model("Block", BlockSchema);

export default BlockModel;
