/* Guide page for demo purposes; insturctions and user manual */
const GuidePage = () => {
  return (
    <div className="guide-page">
      <h1>User Guide</h1>
      <p>
        Hello! Thank you for trying out the Supperfellas demo! Here are the
        features that are available to be tested:
      </p>

      <p>
        For prototyping purposes, the order scraping system will only work with{" "}
        <b>Grab Group Order</b> links.
        <br />
        These links are generated through the Grab mobile app, and starts with
        https://r.grab.com/o/. To generate the link:
        <br />
        For convinience, here are some links I have pre-generated: (don't order
        anything HAHA)
        <ul>
          <li>Link 1</li>
          <li>Link 2</li>
          <li>Link 3</li>
        </ul>
      </p>

      <p>If there are any queries, you can contact us at @</p>
      <hr />
      <p>by Isaac and Aloysius</p>
    </div>
  );
};

export default GuidePage;
