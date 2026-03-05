export const Sources: Record<string, (request: string) => Promise<{
    text: string,
    code: string,
    metadata: Record<string, string>
} | undefined>> = {
    "PyPy": PyPy,
    "PlainText": PlainText,
    "YouTube": YouTube
}

export async function PyPy(request: string) {
    let requestData = {text: "", code: "", metadata: {} as Record<string, string>}
    let res = await fetch('https://api.pypy.dance/bundle')
    if (!res.ok) {return undefined}

    let data = await res.json() as {
        l10n: any,
        groups: Array<string>,
        songs: Array<{
            i: number,
            g: number,
            n: string,
            e: number,
            o: Array<string>,
            t: Array<string>,
        }>
        }
    for (let song of data.songs) {
        // If Request matches ID or YT URL
        if (String(song.i) === String(request)) {
            requestData.code = String(song.i)
            requestData.text = song.n
            requestData.metadata["Source"] = "PyPy"
            // @ts-ignore
            requestData.metadata["Group"] = data.groups[song.g]
            requestData.metadata["Duration"] = String(song.e)
            if (song.o[0]) {
                try {
                    let videoData = await FetchYouTubeVideo(song.o[0]!)
                    requestData.metadata["Thumbnail"] = videoData.snippet.thumbnails.default.url
                    requestData.metadata["Channel"] = videoData.snippet.channelTitle
                } catch (e) {
                    console.log(`Error fetching YouTube Video for PyPy song ${song.i}`)
                    console.log(e)
                }
            }
            return requestData
        }
    }
    return undefined
}

export async function PlainText(request: string) {
    let requestData = {text: "", code: "", metadata: {} as Record<string, string>}
    requestData.text = request
    requestData.code = request
    requestData.metadata["Source"] = "PlainText"
    return requestData
}

export async function YouTube(request: string) {
    try {
        let videoData = await FetchYouTubeVideo(request)
        if (!videoData) {
            return {
                text: videoData.snippet.title,
                code: `https://www.youtube.com/watch?v=${videoData.id}`,
                metadata: {
                    "Source": "YouTube",
                    "Thumbnail": videoData.snippet.thumbnails.default.url,
                    "Channel": videoData.snippet.channelTitle
                },
            }
        } else {
            return undefined
        }
    } catch (e) {
        console.log(`Error fetching YouTube Video for request ${request}`)
        console.log(e)
    }
}

async function FetchYouTubeVideo(url: string) {
    // Filter YT video ID
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi
    let ytRequest = ytRegex.exec(url)
    if (!ytRequest) {return undefined}
    if (!ytRequest[1]) {return undefined}
    console.log(ytRequest[1])

    // Login to YT API
    if (!process.env.GOOGLE_AUTH) {return undefined}
    const googleAuth: GoogleKey = JSON.parse(process.env.GOOGLE_AUTH)
    const oauth = new GoogleOAuth(googleAuth, ["https://www.googleapis.com/auth/youtube.readonly"])
    const token = await oauth.getGoogleAuthToken()
    let video = await fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${ytRequest[1]}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
        }
    })
    if (!video || !video.ok) {return undefined}

    // Format response
    let resData = await video.json()
    return resData.items[0]
}