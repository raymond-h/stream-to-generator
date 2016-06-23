'use strict';

function* streamGenerator(stream, size, opts) {
    size = size || 8192;
    opts = opts || {};

    const highWaterMark = opts.highWaterMark || {};

    let isDone = false;
    let buffer = new Buffer(0);

    stream
    .on('data', data => {
        buffer = Buffer.concat([buffer, data]);

        if(buffer.length >= highWaterMark) {
            stream.pause();
        }
    })
    .on('end', () => {
        isDone = true;
    });

    while(!isDone || buffer.length != 0) {
        const data = buffer.slice(0, size);
        buffer = buffer.slice(size);

        if(buffer.length < highWaterMark) {
            stream.resume();
        }

        yield data;
    }
}

module.exports = streamGenerator;
