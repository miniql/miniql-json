import { createQueryResolver, IJsonResolverConfig } from "..";

describe("query entity", () => {

    it("can create resolver to retreive single entity", async ()  => {

        const config: IJsonResolverConfig = {
            movie: {
                primaryKey: "name",
                jsonFilePath: "movies.json",
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

        const resolver = await createQueryResolver(config, async (jsonFilePath: string) => testJsonData);
        
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
