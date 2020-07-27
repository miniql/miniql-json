import { readJson } from "datakit";

//
// Configures a related entity.
//
export interface IRelatedEntityConfig { //TODO: error check that one of these is present.
    //
    // The type of entity, if different from the nested entity key.
    //
    from?: string;

    //
    // Specifies the column in the parent entity that relates it to the primaryKey in the nested entity.
    //
    parentKey?: string;

    //
    // Specifies the column in the child entity that relates it to the primaryKey in the parent entity.
    //
    foreignKey?: string;
}

//
// Specifies related entites.
//
export interface IRelatedEntities {
    [nestedEntityType: string]: IRelatedEntityConfig;
}

//
// Configures an entity type and specifies which JSON file it is loaded from.
//
export interface IEntityType {

    //
    // Specifies the column in the JSON file that is the primary identifying key for each entity.
    //
    primaryKey: string;

    //
    // The path to the JSON file to load for this entity type.
    //
    jsonFilePath: string; //TODO: error if neither jsonFilePath or jsonData is included. TODO SHOULD BE OPTIONAL.

    // 
    // The JSON data for this entity type.
    //
    jsonData?: string;

    //
    // Specifies other entities that are related to this one.
    //
    nested?: IRelatedEntities;
}

//
// Configures the JSON resolver.
//
export interface IJsonResolverConfig {
    [entityType: string]: IEntityType;
}

//
// Defines a function for loading JSON data.
//
export type LoadJsonDataFn = (filePath: string) => Promise<any[]>;

//
// Creates the JSON resolver with a particular configuration.
//
export async function createQueryResolver(config: IJsonResolverConfig, loadJsonData?: LoadJsonDataFn): Promise<any> {
    const resolver: any = { 
        get: {
        },
    };

    if (loadJsonData === undefined) {
        // If no method if provided to load a JSON file, default to loading from local file system.
        loadJsonData = async (jsonFilePath: string) => {
            return await readJson(jsonFilePath);
        };
    }

    for (const entityTypeName of Object.keys(config)) {
        const entityType = config[entityTypeName];
        const entityResolver: any = { //TODO: type this properly.
            invoke: async (args: any, context: any) => {
                const entities = await loadJsonData!(entityType.jsonFilePath); //TODO: CACHE IT!
                const primaryKey = entityType.primaryKey; //TODO: Error check this is defined!
                const entityId = args[primaryKey];
                if (entityId !== undefined) {
                    // Single entity query.
                    const filteredEntities = entities.filter(entity => entity[primaryKey] === entityId);
                    if (filteredEntities.length > 0) {
                        // At least one entity was found.
                        return filteredEntities[0];
                    }
                    else {
                        // No entity was found.
                        return undefined;
                    }
                }
                else {
                    // Multiple entity query.
                    return entities;
                }
            },
        };

        if (entityType.nested) {
            entityResolver.nested = {};

            const nested = entityType.nested;

            for (const nestedEntityTypeName of Object.keys(entityType.nested)) {
                entityResolver.nested[nestedEntityTypeName] = {
                    invoke: async (parent: any, args: any, context: any) => {
                        const nestedEntityConfig = nested[nestedEntityTypeName];
                        const nestedEntityConfigName = nestedEntityConfig.from || nestedEntityTypeName;
                        const nestedEntityType = config[nestedEntityConfigName]; //todo: error check this exists!
                        const parentKey = nestedEntityConfig.parentKey; //todo: error check entity type object exists! todo: error check one of these exists.
                        const foreignKey = nestedEntityConfig.foreignKey;
                        const nestedEntities = await loadJsonData!(nestedEntityType.jsonFilePath); //TODO: CACHE IT!
                        if (parentKey !== undefined) {
                            const id = parent[parentKey];
                            return nestedEntities.filter(nestedEntity => nestedEntity[nestedEntityType.primaryKey] === id)[0]; //TODO: what if it doesn't exist?
                        }
                        else if (foreignKey !== undefined) {
                            const parentEntityId = parent[entityType.primaryKey]; //todo: check that it exists.
                            return nestedEntities.filter(nestedEntity => nestedEntity[foreignKey] === parentEntityId);
                        }
                        else {
                            //todo: error.
                        }
                    },
                }
            }
        }

        resolver.get[entityTypeName] = entityResolver;
    }

    return resolver;
}