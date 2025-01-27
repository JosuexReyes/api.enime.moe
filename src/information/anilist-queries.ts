import { gql } from 'graphql-request';

export const SPECIFIC_ANIME = gql`
query ($id: Int, $page: Int) {
  Page(page: $page) {
    pageInfo {
      hasNextPage
      total
    }
    media(id: $id, type: ANIME, sort: TITLE_ROMAJI) {
      id
      idMal
      title {
        userPreferred
        romaji
        native
        english
      }
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      seasonInt
      status
      seasonYear
      season
      format
      genres
      synonyms
      duration
      popularity
      episodes
      source(version: 2)
      countryOfOrigin
      hashtag
      averageScore
      siteUrl
      description
      bannerImage
      isAdult
      coverImage {
        extraLarge
        color
      }
      trailer {
        id
        site
        thumbnail
      }
      externalLinks {
        site
        url
      }
      rankings {
        rank
        type
        season
        allTime
      }
      studios(isMain: true) {
        nodes {
          id
          name
          siteUrl
        }
      }
      relations {
        edges {
          relationType(version: 2)
          node {
            id
            type
            title {
              romaji
              native
              english
            }
            siteUrl
          }
        }
      }
      nextAiringEpisode {
        id
        episode
        airingAt
      }
      airingSchedule(notYetAired: true, perPage: 2) {
        nodes {
          episode
          airingAt
        }
      }
    }
  }
}
`

export const AIRING_ANIME = gql`query ($season: MediaSeason, $year: Int, $format: MediaFormat, $formatIn: [MediaFormat], $excludeFormat: MediaFormat, $status: MediaStatus, $minEpisodes: Int, $page: Int) {
  Page(page: $page) {
    pageInfo {
      hasNextPage
      total
    }
    media(season: $season, seasonYear: $year, format: $format, format_in: $formatIn, format_not: $excludeFormat, status: $status, episodes_greater: $minEpisodes, isAdult: false, type: ANIME, sort: TITLE_ROMAJI) {
      id
      idMal
      title {
        userPreferred
        romaji
        native
        english
      }
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      trailer {
        id
        site
        thumbnail
      }
      status
      season
      format
      genres
      seasonYear
      seasonInt
      synonyms
      duration
      popularity
      episodes
      source(version: 2)
      countryOfOrigin
      hashtag
      averageScore
      siteUrl
      description
      bannerImage
      isAdult
      coverImage {
        extraLarge
        color
      }
      trailer {
        id
        site
        thumbnail
      }
      externalLinks {
        site
        url
      }
      rankings {
        rank
        type
        season
        allTime
      }
      studios(isMain: true) {
        nodes {
          id
          name
          siteUrl
        }
      }
      relations {
        edges {
          relationType(version: 2)
          node {
            id
            title {
              romaji
              native
              english
            }
            siteUrl
          }
        }
      }
      nextAiringEpisode {
        id
        episode
        airingAt
      }
    }
  }
}
`