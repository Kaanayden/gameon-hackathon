import mongoose from 'mongoose';

const MaterialSchema = new mongoose.Schema({
    x: {
        type: Number,
        required: true,
    },
    y: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
    }
}, { 
    _id: true 
});

MaterialSchema.index({ x: 1, y: 1 }, { unique: true });

const MaterialModel = mongoose.model("Material", MaterialSchema);

export default MaterialModel;
