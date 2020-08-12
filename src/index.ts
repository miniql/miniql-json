import { readJson } from "datakit";
import { IQueryResolver } from "@miniql/core-types";
import { createQueryResolver as createLazyResolver, IQueryResolverConfig, ILazyDataLoader } from "@miniql/lazy";
export { IQueryResolverConfig, IRelatedEntityConfig, IRelatedEntities, IEntityType, IEntityTypes } from "@miniql/lazy";

//
// Sets JSON file path for each entity type.
//
export interface IJsonFileConfig {
    [entityTypeName: string]: string;
}

//
// Defines a function for loading JSON data.
//
export type LoadJsonDataFn = (filePath: string) => Promise<any[]>;

//
// Creates the JSON resolver with a particular configuration.
//
export function createQueryResolver(config: IQueryResolverConfig, jsonFiles: IJsonFileConfig, loadJsonData?: LoadJsonDataFn): IQueryResolver {
    if (loadJsonData === undefined) {
        // If no method if provided to load a CSV file, default to loading from local file system.
        loadJsonData = async (jsonFilePath: string) => {
            return await readJson(jsonFilePath);
        };
    }

    const dataLoader: ILazyDataLoader = {
        //
        // Loads a single entity.
        //
        async loadSingleEntity(entityTypeName: string, primaryKey: string, entityId: string): Promise<any> {
            const entities = await loadJsonData!(jsonFiles[entityTypeName]);
            const filteredEntities = entities.filter(entity => entity[primaryKey] === entityId);
            if (filteredEntities.length > 0) {
                // At least one entity was found.
                return filteredEntities[0];
            }
            else {
                // No entity was found.
                return undefined;
            }
        },

        //
        // Load the set of entities.
        //
        async loadEntities(entityTypeName: string): Promise<any[]> {
            return await loadJsonData!(jsonFiles[entityTypeName]);
        },
    };
    return createLazyResolver(config, dataLoader);
}