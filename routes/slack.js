import kue from 'kue';
import request from 'superagent';
import debuglog from 'debug';
import { inspect } from 'util';

import lookup from '../lib/lookup';
import services from '../lib/services';
import { find, create } from '../lib/share';

const debug = debuglog('combine.fm:slack');

const queue = kue.createQueue({
  redis: process.env.REDIS_URL,
});

const slackToken = process.env.SLACK_TOKEN;

export default async function (ctx) {
  if (ctx.request.body.challenge) {
    ctx.body = ctx.request.body.challenge;
    return;
  }

  for (const link of ctx.request.body.event.links) {
    if (link.domain === 'combine.fm') {
      continue;
    }

    const music = await lookup(link.url);
    debug(music);
    const payload = {
      channel: ctx.request.body.event.channel,
      attachments: [
        {
          color: '#FE4365',
          author_name: `${music.name} by ${music.artist.name}`,
          author_link: `https://combine.fm/${music.service}/${music.type}/${music.id}`,
          author_icon: music.artwork.small,
        },
      ]
    }
    try {
      const { body } = await request.post('https://slack.com/api/chat.postMessage')
        .set('Authorization', `Bearer ${slackToken}`)
        .send(payload);
      debug(body)
    } catch (err) {
      debug(err);
    }
  }

  ctx.body = 'OK';
}

