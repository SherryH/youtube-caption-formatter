This project provides a simple script for formatting the `vtt` subtitle files to be readable html.

1. Use a tool like [youtube-dl](https://github.com/rg3/youtube-dl) to download the captions of a video
```
// To download auto generated captions without the video itself
> youtube-dl --write-auto-sub --skip-download https://www.youtube.com/watch?v=YODPgBadj80
```
1. Place the video inside the `captionInput` folder
1. Run `node makeCaption.js`
1. View the output html file in the `captionOutput` folder

Note: other redundant files like `quickstart.js` are kept for now for future investigation on downloading the captions via youtube api.