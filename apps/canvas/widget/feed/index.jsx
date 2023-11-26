// Feed
const type = props.type || "canvas";

const things = Social.keys(`*/${type}/*`, "final", {
  return_type: "BlockHeight",
});

if (!things) {
  return "Loading...";
}

const Container = styled.div`
  margin: 0 auto;
  padding: 20px;
  width: 100%;
  max-width: 1200px;
`;

const Grid = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));

  @media (min-width: 576px) {
    grid-gap: 15px;
  }

  @media (min-width: 992px) {
    grid-gap: 20px;
  }

  > * {
    transition: transform 0.3s ease; // Smooth transition for hover effect

    &:hover {
      transform: scale(1.03); // Subtle scale effect on hover
    }
  }
`;

const processData = useCallback(
  (data) => {
    const accounts = Object.entries(data);

    const allItems = accounts
      .map((account) => {
        const accountId = account[0];
        return Object.entries(account[1][type]).map((kv) => {
          return {
            accountId,
            type: type,
            name: kv[0],
            metadatadata: Social.get(
              `${accountId}/${type}/${kv[0]}/metadata/**`,
              "final"
            ),
          };
        });
      })
      .flat();

    // sort by latest
    allItems.sort((a, b) => b.blockHeight - a.blockHeight);
    return allItems;
  },
  [type]
);

const items = processData(things);

if (!items) {
  return "Loading data...";
}

if (items.length === 0) {
  return `No items of type: "${type}" found.`;
}

function Item({ accountId, name, type, metadata }) {
  // Use metadata.name if it exists, otherwise use the passed name
  const displayName = metadata.name || name;

  return (
    <div
      className="card"
      style={{
        maxWidth: "100%",
        height: "200px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      {metadata.backgroundImage && (
        <div
          className="card-img-top"
          style={{
            backgroundImage: `url(${metadata.backgroundImage})`,
            height: "80px",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
      )}

      {metadata.image && (
        <img
          src={metadata.image}
          className="card-img-top"
          alt={displayName}
          style={{ height: "80px", objectFit: "cover" }}
        />
      )}

      <div className="card-body">
        <Link
          to={`/${accountId}/${type}/${name}`}
          style={{ textDecoration: "none" }}
        >
          <h5 className="card-title">{displayName}</h5>
        </Link>
        {metadata.description && (
          <p
            className="card-text"
            style={{ overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {metadata.description}
          </p>
        )}
        <p className="card-text">
          <small className="text-muted">Account ID: {accountId}</small>
        </p>
        <p className="card-text">
          <small className="text-muted">Type: {type}</small>
        </p>
      </div>
      {context.accountId && (
        <>
          <Widget
            src="mob.near/widget/N.StarButton"
            props={{
              item: {
                type: "social",
                path: `${accountId}/${type}/${name}`,
              },
            }}
          />
          <Widget
            src="mob.near/widget/N.LikeButton"
            props={{
              item: {
                type: "social",
                path: `${accountId}/${type}/${name}`,
              },
            }}
          />
        </>
      )}
    </div>
  );
}

return (
  <Container>
    <h3 className="mb-3">every {type}</h3>
    <Widget
      src="/*__@appAccount__*//widget/ItemFeed"
      props={{
        items: items,
        renderItem: Item,
        perPage: 100,
        renderLayout: (items) => <Grid>{items}</Grid>,
      }}
    />
  </Container>
);
