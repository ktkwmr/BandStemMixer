# Third-Party Software Notices

Band Stem Mixer

This application uses the following third-party software and AI model.
The app's own code is in plain HTML, CSS, and JavaScript.

------------------------------------------------------------------------

### Demucs (htdemucs)
- Model: htdemucs (Demucs v4, Hybrid Transformer Demucs, 4 sources: drums, bass, other, vocals)
- Code license: MIT
- Copyright: Copyright (c) Meta Platforms, Inc. and affiliates.
- Source: https://github.com/facebookresearch/demucs
- Weights: NOT covered by the MIT license. Meta provides the pretrained weights
  for scientific purposes only (https://github.com/facebookresearch/demucs/issues/327).
  This app is non-commercial (no ads, no paid features) for this reason.
- Model file: htdemucs_embedded.onnx (ONNX export by timcsy,
  https://huggingface.co/timcsy/demucs-web-onnx). It is downloaded by the
  browser from Hugging Face when a song is separated; this app does not
  redistribute it.
- Use: the AI model that separates a song into 4 parts.

MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

------------------------------------------------------------------------

### onnxruntime-web
- Package: onnxruntime-web
- Purpose: A Javascript library for running ONNX models on browsers
- License: MIT
- Source: https://github.com/Microsoft/onnxruntime
- Copyright: Copyright (c) Microsoft Corporation

MIT License

Copyright (c) Microsoft Corporation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

### demucs-web
- Package: demucs-web
- Purpose: Music source separation (Demucs) running in browser with ONNX Runtime Web
- License: MIT
- Copyright: 2024
- Source: https://github.com/timcsy/demucs-web
- License text:

    MIT License

    Copyright (c) 2024

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

### @breezystack/lamejs
- Package: @breezystack/lamejs
- Purpose: Pure JavaScript MP3 Encoder
- License: LGPL-3.0
- Source: https://github.com/shijinyu/lamejs
- Use: makes the MP3 files when a part or the mix is saved. This app uses
  LAME (https://lame.sourceforge.io/) through lamejs, a JavaScript port of
  LAME. It is loaded unmodified as a separate file from the CDN.
- Full LGPL-3.0 text: https://www.gnu.org/licenses/lgpl-3.0.html
- License text:

    Can I use LAME in my commercial program?  

    Yes, you can, under the restrictions of the LGPL.  The easiest
    way to do this is to:

    1. Link to LAME as separate jar (lame.min.js or lame.all.js)

    2. Fully acknowledge that you are using LAME, and give a link
       to our web site, lame.sourceforge.net

    3. If you make modifications to LAME, you *must* release these
       these modifications back to the LAME project, under the LGPL.

<!-- New libraries are added above this line by scripts/update-third-party-licenses.mjs -->
