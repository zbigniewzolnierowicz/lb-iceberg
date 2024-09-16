import { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
    "title": "ListenBrainz Iceberg"
}

export default function Home() {

    async function getData(formData: FormData) {
        'use server'

        const cookieStore = cookies()

        const user = formData.get("user") as string
        const mode = formData.get("mode") as string
        const count = parseInt(formData.get("amount") as string) ?? 20
        const period = formData.get("period") as string ?? "all_time"
        const apikey = formData.get("apikey") as string;

        cookieStore.set("options", JSON.stringify({ user, mode, count, period, apikey }), { secure: true, sameSite: "strict" })

        return redirect("/result")
    }

    return (
        <main className="max-w-screen-md ">
            <h1 className="text-3xl">
                <span className="text-[#EB743B]">ListenBrainz</span> iceberg chart generator
            </h1>
            <div className="flex flex-col my-4">
                <p className="mb-4">
                    Generate an{" "}
                    <a href="https://knowyourmeme.com/memes/iceberg-tiers-parodies">iceberg chart</a >{" "}
                    based on your most played artists, albums or tracks and their respective
                    listener count.
                </p>

                <div className="w-full flex flex-row justify-evenly text-yellow-400">
                    <a href="https://henry.dawdle.space/">original creator of the last.fm version</a>
                    <a href="https://lastfm-iceberg.dawdle.space/">original last.fm version</a>
                    <a href="https://github.com/zbigniewzolnierowicz/listenbrainz-iceberg">source code</a>
                </div>
            </div>
            <form action={getData} className="flex flex-col items-center">
                <div className="grid grid-cols-2 gap-2">
                    <label className="w-full">
                        ListenBrainz username
                        <input className="w-full mt-1" name="user" autoFocus required />
                    </label>
                    <label className="w-full">
                        ListenBrainz Client Key
                        <input className="w-full mt-1" name="apikey" autoFocus required />
                    </label>
                    <label className="w-full">
                        Data to plot
                        <select className="w-full mt-1" name="mode" defaultValue="artists">
                            <option value="artists">Artists</option>
                            <option value="release-groups">Albums</option>
                        </select>
                    </label>
                    <label className="w-full">
                        Date period
                        <select className="w-full mt-1" name="period" defaultValue="all_time">
                            <option value="this_week">Week</option>
                            <option value="this_month">Month</option>
                            <option value="this_year">Year</option>
                            <option value="all_time">Overall</option>
                        </select>
                    </label>
                    <label className="col-span-full">
                        Number of results
                        <input className="w-full mt-1" type="number" name="amount" min="5" max="100" defaultValue="50" />
                    </label>
                </div>
                <input id="submit" type="submit" value="Generate" className="mt-4 bg-[#EB743B] text-black border-none p-2" />
            </form>
        </main>
    );
}
