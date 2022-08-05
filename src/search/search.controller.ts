import { BadRequestException, CacheTTL, Controller, Get, Param, Query } from '@nestjs/common';
import DatabaseService from '../database/database.service';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { createPaginator } from 'prisma-pagination';
import { PaginateFunction } from 'prisma-pagination/src';
import Prisma from '@prisma/client';
import { clearAnimeField } from '../helper/model';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import Search from '../entity/search.entity';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import Anime from '../entity/anime.entity';

@Controller("/search")
@ApiTags("search")
export default class SearchController {
    searchPaginator: PaginateFunction = undefined;

    constructor(private readonly databaseService: DatabaseService/*, private readonly elasticsearchService: ElasticsearchService*/) {
        this.searchPaginator = createPaginator({ })
    }

    @Get(":query")
    @CacheTTL(300)
    @Throttle(90, 60)
    @ApiOperation({ operationId: "Search Anime", summary: "Search anime based on query" })
    @ApiResponse({
        status: 200,
        description: "The list of anime matched from search query",
        type: Anime,
        isArray: true
    })
    @ApiResponse({
        status: 429,
        description: "The API throttling has been reached, check response headers for more information"
    })
    @ApiQuery({
        type: Number,
        name: "page",
        required: false,
        description: "The page number of search list, default to 1"
    })
    @ApiQuery({
        type: Number,
        name: "perPage",
        required: false,
        description: "How many elements per page should this response have? Minimum: 1, maximum: 100"
    })
    async search(@Param("query") query: string, @Query("page") page: number, @Query("perPage") perPage: number) {
        if (query.length <= 2) throw new BadRequestException("The search query has to be greater than or equal to 2.");

        if (!page || page <= 0) page = 1;
        if (!perPage || perPage <= 0) perPage = 20;
        perPage = Math.min(100, perPage);

        // See https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#sql-injection, Prisma mitigates potential SQL injections already
        const skip = page > 0 ? perPage * (page - 1) : 0

        const count = await this.databaseService.$queryRaw`
            SELECT COUNT(*) FROM anime
            WHERE
                ${"%" + query + "%"} % ANY(synonyms)
                OR  anime.title_english ILIKE ${"%" + query + "%"}
                OR  anime.title_romaji  ILIKE ${"%" + query + "%"}
        `;

        // @ts-ignore
        const total = count.count;

        const results: Anime[] = await this.databaseService.$queryRaw`
            SELECT * FROM anime 
            WHERE 
                ${"%" + query + "%"} % ANY(synonyms)
                OR  anime.title_english ILIKE ${"%" + query + "%"}
                OR  anime.title_romaji  ILIKE ${"%" + query + "%"}
            ORDER BY
                anime.title_english ILIKE ${"%" + query + "%"} OR NULL,
                anime.title_romaji  ILIKE ${"%" + query + "%"} OR NULL
            LIMIT    ${perPage}
            OFFSET   ${skip}
        `;

        const lastPage = Math.ceil(total / perPage)

        for (let result of results) {
            delete result["title_english"];
            delete result["title_romaji"];

            const genreIds: string[] = ((await this.databaseService.$queryRaw`
            SELECT * FROM "_AnimeToGenre" WHERE "A" = ${result.id}
            `) as object[]).map(relation => relation["B"]);

            const genres = await this.databaseService.$transaction(genreIds.map(id => this.databaseService.genre.findUnique({ where: { id } })));

            result.genre = genres.map(genre => genre.name);
        }

        return {
            data: results,
            meta: {
                total: total,
                lastPage,
                currentPage: page,
                perPage,
                prev: page > 1 ? page - 1 : null,
                next: page < lastPage ? page + 1 : null,
            },
        }
    }
}