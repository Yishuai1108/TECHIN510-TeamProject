import requests
import re

# === 请在这里填写你的 token 和歌单链接 ===
ACCESS_TOKEN = 'BQDo7wTKG4KPoeAcw9TTCWUORdxopixVjznZrJ6TlysDJ8_QiCGpNZHArGcRgCH0CKKF7DZkAFpPdzhVLVU65cYBJeVnBCFdK8Pbt_GjfuHn0p33iSRgbaq00DsWRwYznBZK6VZvsZI8niYunHsMBrGy17k7v9fIAQO4c_fbY5bmALTFql3ROA9OtlVxFYBQxxjYT57-NOBGLeW0wNb9JFfZIq4e1oM2-VNn7rjDxqqxqAskS6ToLdJG3ufjA-vzmO1JKW52sxB0ixrLIfac43NOkIUTYtJv2dZZpIRdyODj8qWPXIZGA8VszToT9eKFBKs'
playlist_url = 'https://open.spotify.com/playlist/35iwgR4jXetI318WEWsa1Q'

# === 从链接中提取 playlist ID ===
match = re.search(r'playlist/([a-zA-Z0-9]+)', playlist_url)
if not match:
    raise ValueError("歌单链接不合法，请检查")

playlist_id = match.group(1)

# === 获取所有 track ===
headers = {'Authorization': f'Bearer {ACCESS_TOKEN}'}
url = f'https://api.spotify.com/v1/playlists/{playlist_id}/tracks?limit=100'
results = []

while url:
    res = requests.get(url, headers=headers).json()
    for item in res.get('items', []):
        track = item.get('track')
        if track and track.get('preview_url'):
            title = track['name']
            artist = track['artists'][0]['name']
            link = track['external_urls']['spotify']
            preview = track['preview_url']
            results.append((title, artist, link, preview))
    url = res.get('next')

# === 打印结果 ===
print(f"\n✅ 发现 {len(results)} 首带 preview 的歌曲：")
for i, (title, artist, link, preview) in enumerate(results, 1):
    print(f"{i}. {title} - {artist}")
    print(f"   🔗 {link}")
    print(f"   🔊 {preview}\n")
