const { Lua } = require('wasmoon-lua5.1');
var fs = require('fs');

//
// This is an example of how to use wasmoon-lua5.1 to parse the itemInfo.lub file and store it in a table
//
async function example() {
    //
    // Create lua global (also a wasm instance)
    //
    const lua = await Lua.create();

    //
    // create a table to store item info
    //
    let ItemTable = {};

    try {
        //
        // Get context, a proxy. It will be used to interact with lua conveniently
        //
        const ctx = lua.ctx;

        //
        // Create functions in context
        //
        ctx.AddItem = (ItemID, unidentifiedDisplayName, unidentifiedResourceName, identifiedDisplayName, identifiedResourceName, slotCount, ClassNum) => {
            ItemTable[ItemID] = {
                unidentifiedDisplayName: unidentifiedDisplayName,
                unidentifiedResourceName: unidentifiedResourceName,
                identifiedDisplayName: identifiedDisplayName,
                identifiedResourceName: identifiedResourceName,
                unidentifiedDescriptionName: [],
                identifiedDescriptionName: [],
                EffectID: null,
                costume: null,
                PackageID: null,
                slotCount: slotCount,
                ClassNum: ClassNum
            };

            return 1;
        };

        ctx.AddItemUnidentifiedDesc = (ItemID, v) => {
            ItemTable[ItemID].unidentifiedDescriptionName.push(v);
            return 1;
        };

        ctx.AddItemIdentifiedDesc = (ItemID, v) => {
            ItemTable[ItemID].identifiedDescriptionName.push(v);
            return 1;
        };

        ctx.AddItemEffectInfo = (ItemID, EffectID) => {
            ItemTable[ItemID].EffectID = EffectID;
            return 1;
        };

        ctx.AddItemIsCostume = (ItemID, costume) => {
            ItemTable[ItemID].costume = costume;
            return 1;
        };

        ctx.AddItemPackageID = (ItemID, PackageID) => {
            ItemTable[ItemID].PackageID = PackageID;
            return 1;
        };

        //
        // Load local file
        //
        var file = fs.readFileSync('./itemInfo.lub');

        //
        // Mount file
        //
        lua.mountFile('itemInfo.lub', file);

        //
        // Execute file
        //
        await lua.doFile('itemInfo.lub');

        //
        // Execute main lua function
        //
        lua.doStringSync(`main()`);

        //
        // Print first 50 items in console
        //
        let i = 0;
        for (const key in ItemTable) {
            console.log(key, ItemTable[key].identifiedDisplayName, ItemTable[key].identifiedResourceName);
            i++;
            if (i > 50) {
                break;
            }
        }
    } catch (error) {
        //
        // Print error in console
        //
        console.error(error);
    } finally {
        //
        // Close the lua environment, so it can be freed
        //
        lua.global.close();
    }
}

example();