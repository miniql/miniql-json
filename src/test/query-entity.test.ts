import { createQueryResolver, IQueryResolverConfig, IJsonFileConfig } from "..";

describe("query entity", () => {

    it("can create resolver to retreive single entity", async ()  => {

        const config: IQueryResolverConfig = {
            entities: {
                movie: {
                    primaryKey: "name",
                },
            },
        };

        const testJsonData = [
            {
                name: "The Bourne Identity",
                year: 2002,
            },
            {
                name: "Minority Report",
                year: 2002,
            },
        ];

        const jsonFiles: IJsonFileConfig = {
            movie: "movies.json",
        };

        const resolver = await createQueryResolver(config, jsonFiles, async (jsonFilePath: string) => testJsonData);
        
        const args = { 
            name: "The Bourne Identity",
        };
        const result = await resolver.get.movie.invoke(args, {});
        expect(result).toEqual({
            name: "The Bourne Identity",
            year: 2002,
        });
    });

});
