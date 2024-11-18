import mongoose from 'mongoose';

const LandSchema = new mongoose.Schema({
    x: {
        type: Number,
        required: true,
    },
    y: {
        type: Number,
        required: true,
    },
    ownerAddress: {
        type: String,
        required: true,
    },
}, { 
    _id: false 
});

LandSchema.index({ x: 1, y: 1 }, { unique: true });

const LandModel = mongoose.model("Land", LandSchema);

export default LandModel;
