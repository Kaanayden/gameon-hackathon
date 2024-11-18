import LandModel from "../models/LandModel.js";


export async function getOwnerAddress(req, res) {

    const landX = req.query.x;
    const landY = req.query.y;

    if(landX < 1 || landY < 1 || landX > 20 || landY > 20) {
        return res.status(400).send("Invalid coordinates"); 
    }

    const land = await LandModel.findOne({ x: landX, y: landY });

    if(land) {
        return res.status(200).json({ ownerAddress: land.ownerAddress });
    } else {
        return res.status(200).json({ ownerAddress: null });
    }
}

export async function getLands(req, res){
    const lands = await LandModel.find();
    
    return res.status(200).json(lands);
}



