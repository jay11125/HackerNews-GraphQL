import { AUTH_TOKEN, LINKS_PER_PAGE } from "../constants";
import { timeDifferenceForDate } from "../utils";
import { useMutation, gql } from "@apollo/client";
import { FEED_QUERY } from "./LinkList";

const VOTE_MUTATION = gql`
  mutation VoteLink($linkId: ID!) {
    voteLink(linkId: $linkId) {
      id
      votes
    }
  }
`;

const Link = (props) => {
  const { link } = props;
  const authToken = localStorage.getItem(AUTH_TOKEN);

  const [voteLink] = useMutation(VOTE_MUTATION, {
    variables: {
      linkId: link.id,
    },
    update: (cache, { data: { voteLink } }) => {
      const take = LINKS_PER_PAGE;
      const skip = 0;
      const orderBy = { createdAt: "desc" };
      const data = cache.readQuery({
        query: FEED_QUERY,
        variables: {
          take,
          skip,
          orderBy,
        },
      });

      const updatedLinks = data.feed.links.map((feedLink) => {
        if (feedLink.id === link.id) {
          return {
            ...feedLink,
            votes: voteLink.votes,
          };
        }
        return feedLink;
      });

      cache.writeQuery({
        query: FEED_QUERY,
        data: {
          feed: {
            links: updatedLinks,
            count: data.feed.count,
          },
        },
        variables: {
          take,
          skip,
          orderBy,
        },
      });
    },
  });

  return (
    <div className="flex mt2 items-start">
      <div className="flex items-center">
        <span className="gray" style={{ width: "30px", textAlign: "right" }}>
          {props.index + 1}.
        </span>
        {authToken && (
          <div className="ml1 gray f11 pointer" onClick={voteLink}>
            ▲
          </div>
        )}
      </div>
      <div className="ml2">
        <a className="link black" target="_blank" rel="noreferrer" href={link.url}>
          {link.description}
        </a>
        <span className="gray f11"> ({link.url})</span>
        {
          <div className="f6 lh-copy gray">
            {link.votes.length} votes | by {link.postedBy ? link.postedBy.name : "Unknown"}{" "}
            {timeDifferenceForDate(link.createdAt)}
          </div>
        }
      </div>
    </div>
  );
};

export default Link;
