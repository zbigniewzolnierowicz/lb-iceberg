import axiosRateLimit from "axios-rate-limit"
import axios from "axios"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import ResultBox from "@/components/result"
import { Metadata } from "next"

type Options = { user: string, mode: string, count: string, period: string, apikey: string }
type Artist = { artist_mbid: string | null, artist_name: string, listen_count: number }
type Album = { release_group_mbid: string | null, artist_name: string, release_group_name: string, listen_count: number }

export const metadata: Metadata = {
    "title": "ListenBrainz Iceberg"
}

export default async function Result() {
    const http = axiosRateLimit(axios.create(), { maxRequests: 30, perMilliseconds: 60 * 1000 })

    async function getData(): Promise<[string, number, string][]> {
        const cookieStore = cookies()

        const optionsUnparsed = cookieStore.get("options")

        if (!optionsUnparsed?.value) return redirect("/")

        const opt: Options = JSON.parse(optionsUnparsed.value)

        const fetchTopArtistsURL = new URL(`https://api.listenbrainz.org/1/stats/user/${opt.user}/${opt.mode}`)

        fetchTopArtistsURL.searchParams.set("count", opt.count)
        fetchTopArtistsURL.searchParams.set("range", opt.period)

        const userData = await http.get(fetchTopArtistsURL.toString(), {
            headers: {
                "Authorization": `Token ${opt.apikey}`
            }
        })
            .then(r => r.data)

        let data: [string, number, string][];
        switch (opt.mode) {
            case "release-groups":
                data = await getAlbumStats((userData as any).payload['release_groups'], parseInt(opt.count), opt.apikey)
                break;
            case "artists":
                data = await getArtistStats((userData as any).payload.artists, parseInt(opt.count), opt.apikey)
                break;
            default:
                data = [];
                break;
        }

        data = data.sort((x, y) => x[1] - y[1]).reverse();
        data = data.map((x) => [x[0], x[1] - Math.min(...data.map((x) => x[1])), x[2]]);
        data = data.map((x) => [x[0], x[1] / Math.max(...data.map((x) => x[1])), x[2]]);
        data = data.map((x) => [x[0], 8 - x[1] * 8, x[2]]);
        data = data.map((x, i) => [x[0], Math.round((x[1] + (i / data.length) * 24) / 4), x[2]]);

        return data
    }

    async function getArtistStats(artists: Artist[], amount: number, apikey: string): Promise<any[]> {
        return await Promise.all(
            artists
                .filter(a => a.artist_mbid !== null)
                .slice(0, amount)
                .map(
                    async (a): Promise<[string, number, string] | null> => {
                        const fetchArtistUrl = new URL(`https://api.listenbrainz.org/1/stats/artist/${a.artist_mbid}/listeners`)
                        const data: any | null = await http.get(fetchArtistUrl.toString(), {
                            headers: {
                                "Authorization": `Token ${apikey}`
                            },
                        })
                            .then(res => res.data)

                        return [
                            a.artist_name,
                            data?.payload?.total_listen_count as number ?? 0,
                            `https://musicbrainz.org/artist/${a.artist_mbid}`
                        ]
                    }
                )
        )
    }

    async function getAlbumStats(albums: Album[], amount: number, apikey: string): Promise<any[]> {
        return await Promise.all(
            albums
                .filter(a => a.release_group_mbid !== null)
                .slice(0, amount)
                .map(
                    async (a): Promise<[string, number, string] | null> => {
                        const fetchAlbumUrl = new URL(`https://api.listenbrainz.org/1/stats/release-group/${a.release_group_mbid}/listeners`)
                        const data: any | null = await http.get(fetchAlbumUrl.toString(), {
                            headers: {
                                "Authorization": `Token ${apikey}`
                            },
                        })
                            .then(res => res.data)

                        return [
                            `${a.artist_name} - ${a.release_group_name}`,
                            data?.payload?.total_listen_count as number ?? 0,
                            `https://musicbrainz.org/release-group/${a.release_group_mbid}`
                        ]
                    }
                )
        )
    }

    const result = await getData();

    return (
        <ResultBox result={result} />
    )
}

export const runtime = 'edge';
