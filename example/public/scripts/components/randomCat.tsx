import React from "react";
import _ from "lodash";
import moment from "moment";

export const RandomCatComponent = () => {
  const [cats, setCats] = React.useState();
  const [loading, setLoading] = React.useState(false);

  async function fetchRandomCat() {
    setCats(null);
    setLoading(true);

    try {
      const r = await fetch("https://api.thecatapi.com/v1/images/search", {
        credentials: 'omit',
        headers: {
          'x-api-key': '87b4a7d4-0a4f-4c20-a54d-c1ad0973e22c'
        }
      });
      const body = await r.json();

      setCats(body);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return <div>
    <h1>{moment().format('dddd')} is a good day for looking at cat pics</h1>
    <p><button onClick={fetchRandomCat}>Get random cat pic</button></p>
    {loading ? <p><i>Loading...</i></p> : ''}
    {cats ? <p><img width="400" src={_.get(cats, '0.url')} onLoad={() => setLoading(false)} /></p> : ''}
    <p><small>Cat pics provided by <a href="https://thecatapi.com/">TheCatAPI</a></small></p>
  </div>;
}
