import test from 'ava';
import jsv from 'jsverify';
import streamTest from 'streamtest';

import streamGenerator from '../lib/index';

const buffer = jsv.nearray(jsv.integer(0, 255)).smap(
    a => new Buffer(a),
    Array.from
);

test('generator from stream', async t => {
    await jsv.assert(
        jsv.forall(jsv.array(buffer), async buffers => {

            const totalLength = buffers
                .map(b => b.length)
                .reduce((a, b) => a + b, 0);

            let actualLength = 0;

            const stream = streamTest.v2.fromChunks(buffers);
            const gen = streamGenerator(stream);

            for(const b of gen) {
                actualLength += b.length;

                // constantly consuming this generator means
                // the generator has no chance of stocking up on
                // chunks from the underlying stream (since that's async),
                // so we gotta wait until next event loop
                await new Promise(resolve => setImmediate(resolve));
            }

            return actualLength === totalLength;
        })
    );
});
