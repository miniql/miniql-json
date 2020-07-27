import { createQueryResolver, IJsonResolverConfig } from "..";

describe("query nested entity", () => {

    it("can create function to retreive a nested entity", async ()  => {

        const config: IJsonResolverConfig = {
            movie: {
                primaryKey: "name",
                jsonFilePath: "movies.json",
                nested: {
                    director: {
                        parentKey: "directorId",
                    },
                },
            },
            director: {
                primaryKey: "id",
                jsonFilePath: "directors.json",
            },
        };

        const directorsTestData = [
            {
                id: "1234",
                name: "Doug Liman",
            },
        ];

        async function loadTestData(jsonFilePath: string): Promise<any[]> {
            if (jsonFilePath === "directors.json") {
                return directorsTestData;
            }
            else {
                throw new Error(`Unexpected JSON file path "${jsonFilePath}".`);
            }
        }

        const resolver = await createQueryResolver(config, loadTestData);
        
        const parentEntity = {
            name: "The Bourne Identity",
            year: 2002,
            directorId: "1234",
        };

        const result = await resolver.get.movie.nested.director.invoke(parentEntity, {}, {});
        expect(result).toEqual({
            id: "1234",
            name: "Doug Liman",
        });
    });

    it("can create function to retreive a nested entities", async ()  => {

        const config: IJsonResolverConfig = {
            movie: {
                primaryKey: "name",
                jsonFilePath: "movies.json",
                nested: {
                    director: {
                        foreignKey: "movie",
                    },
                },
            },
            director: {
                primaryKey: "name",
                jsonFilePath: "directors.json",
            },
        };

        const moviesTestData = [
            {
                name: "The Bourne Identity",
                year: 2002,
            },
        ];

        const directorsTestData = [
            {
                name: "Doug Liman",
                movie: "The Bourne Identity",
            },
        ];

        async function loadTestData(jsonFilePath: string): Promise<any[]> {
            if (jsonFilePath === "movies.json") {
                return moviesTestData;
            }
            else if (jsonFilePath === "directors.json") {
                return directorsTestData;
            }
            else {
                throw new Error(`Unexpected JSON file path "${jsonFilePath}".`);
            }
        }

        const resolver = await createQueryResolver(config, loadTestData);
        
        const parentEntity = { 
            name: "The Bourne Identity",
        };

        const result = await resolver.get.movie.nested.director.invoke(parentEntity, {}, {});
        expect(result).toEqual([ 
            {
                name: "Doug Liman",
                movie: "The Bourne Identity",
            },
        ]);
    });
});
