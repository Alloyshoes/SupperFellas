import { getAuth } from "firebase/auth";
import { useState } from "react";
import "./Guide.css";

import group_order_button from "../../assets/group_order_button.png";

/* Guide page for demo purposes; insturctions and user manual */
const GuidePage = () => {
  const auth = getAuth();
  const [name, setName] = useState("");
  getAuth()
    .authStateReady()
    .then(() => {
      const user = auth.currentUser;
      if (user === undefined || user === null) {
        setName("");
        return;
      }
      setName(auth.currentUser.email.split("@")[0]);
    });

  return (
    <div className="guide-page">
      <h1>SupperFellas User Guide</h1>
      <p style={{ fontSize: "x-large" }}>
        Hello <i>{name}</i>! Thank you for trying out the SupperFellas demo! :)
        Below is a short guide on the different features of available in the
        demo.
      </p>

      <h2>Creating New Posts</h2>
      <p>
        SupperFellas is designed for users to create posts of group orders for
        other users to join, or joining orders that other users have created.
        These posts each represent a group order, where users can view, join and
        chat!
      </p>

      <h3>Order Links</h3>
      <div>
        For prototyping purposes, the order scraping system will only work with{" "}
        <b>Grab Group Order</b> links. These links are generated through the{" "}
        <b>Grab</b> mobile app, and typically starts with{" "}
        <code>https://r.grab.com/o/</code>.
        <p>
          To generate your own link yourself, click into any restaurant in the{" "}
          <i>GrabFood</i> mobile app, and select the <i>Group Order</i> option.
          You will be able to create a Group Order, where a link can be shared.
        </p>
        <img src={group_order_button}></img>
        <p>
          For your convenience, I have prepared some pre-generated links to be
          freely used! (pls don't order anything HAHA)
        </p>
        <table>
          <tbody>
            <tr>
              <td style={{ paddingRight: 50 }}>
                1.{" "}
                <a href="https://r.grab.com/o/iyM73yMb">
                  https://r.grab.com/o/iyM73yMb
                </a>{" "}
              </td>
              <td>(McDonalds)</td>
            </tr>
            <tr>
              <td>
                2.{" "}
                <a href="https://r.grab.com/o/jMJZviYn">
                  https://r.grab.com/o/jMJZviYn
                </a>{" "}
              </td>
              <td>(Springleaf Prata)</td>
            </tr>
            <tr>
              <td>
                3.{" "}
                <a href="https://r.grab.com/o/VzmQ36Vz">
                  https://r.grab.com/o/VzmQ36Vz
                </a>{" "}
              </td>
              <td>(Lok Lok Dynasty)</td>
            </tr>
            <tr>
              <td>
                4.{" "}
                <a href="https://r.grab.com/o/mAJjABra">
                  https://r.grab.com/o/mAJjABra
                </a>{" "}
              </td>
              <td>(Egg Thai)</td>
            </tr>
            <tr>
              <td>
                5.{" "}
                <a href="https://r.grab.com/o/FjMnERba">
                  https://r.grab.com/o/FjMnERba
                </a>{" "}
              </td>
              <td>(Wingstop)</td>
            </tr>
            <tr>
              <td>
                6.{" "}
                <a href="https://r.grab.com/o/YBzQbiuq">
                  https://r.grab.com/o/YBzQbiuq
                </a>
              </td>
              <td>(Domino's Pizza)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Posting Process</h3>
      <p>
        After submitting a post, it will appear in under the open orders. Behind
        the scenes, there is a automated headless browser (magically) scraping
        the site for useful data that will be displayed in the post. This will
        inevitably take some time, so it will eventually appear if the scraping
        is successful. This is all done server-side, so you don't have to wait
        at the page for it to be done.
      </p>
      <p>
        There will be a📍pin for the restaurant on the map in the{" "}
        <a href="/Orders">Orders page</a> as well!
      </p>

      <h3>Recommendations/Reviews</h3>
      <p>
        Users are able to recommend and review the restaurant of currently open
        group orders. This can be seen in the{" "}
        <a href="/Reco">Recommendations page</a>, where reviews from other users
        are also welcomed.
      </p>

      <h2>Demo Limits</h2>
      <p>
        To control the amount of data stored in the database, there are limits
        set to make sure the total data size is under the limit of the database.
        No worries since you can delete posts.
      </p>
      <ul>
        <li>Group Order Posts: 15</li>
        <li>Chat History: 15</li>
        <li>Recommendations: 15</li>
        <li>Reviews: 10</li>
      </ul>

      <h2>Reflections</h2>
      <p>
        Both me (Isaac) and Aloysius learnt a lot during this whole journey of
        ideating, learning and developing SupperFellas. It was not easy,
        especially since we were damn noob, and even though this might not seem
        like much, we really tried to challenge ourselves and push our
        boundaries.{" "}
        <span style={{ fontSize: "x-small" }}>
          Maybe the real supperfellas were the fellas we made along the way…
        </span>
      </p>

      <hr />
      <br />
      <p style={{ fontSize: "small" }}>SupperFellas by Isaac and Aloysius</p>
    </div>
  );
};

export default GuidePage;
