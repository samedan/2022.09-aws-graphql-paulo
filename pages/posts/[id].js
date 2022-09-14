import { API, Storage } from "aws-amplify";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../../configureAmplify";
import { listPosts, getPost } from "../../src/graphql/queries";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { createComment } from "../../src/graphql/mutations";
// import SimpleMDE from "react-simplemde-editor";
// prevents 'navigator' SSR error
import dynamic from "next/dynamic";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});
import "easymde/dist/easymde.min.css";

const initialState = { message: "" };

export default function Post({ post }) {
  const [coverImage, setCoverImage] = useState(null);
  const [comment, setComment] = useState(initialState);
  const [showMe, setShowMe] = useState(false);

  const { message } = comment;

  useEffect(() => {
    updateCoverImage();
  }, []);

  function toggle() {
    setShowMe(!showMe);
  }

  async function updateCoverImage() {
    if (post.coverImage) {
      const imageKey = await Storage.get(post.coverImage);
      setCoverImage(imageKey);
    }
  }

  async function createTheComment() {
    if (!message) return;
    const id = uuid();
    comment.id = id;
    try {
      await API.graphql({
        query: createComment,
        variables: { input: comment }, // comment is an {}
        authMode: "AMAZON_COGNITO_USER_POOLS",
      });
      console.log("Comment created", comment);
    } catch (error) {
      console.log(error);
    }
    router.push("/my-posts");
  }
  const router = useRouter();

  const markdown = `${post.content}`;

  if (router.isFallback) {
    return <div>Loading...</div>;
  }
  console.log(post.content);
  return (
    <div>
      <h1 className="text-5xl mt-4 font-semibold tracing-wide">{post.title}</h1>
      {coverImage && <img src={coverImage} className="mt-4" />}
      <p className="text-sm font-light my-4">By {post.username}</p>
      <div className="mt-8">
        {/* <ReactMarkdown className="prose" children={post.content} /> */}
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
      <div className="pY-8">
        <button
          type="button"
          className="mb-4 bg-green-600 text-white font-semibold px-8 py-2 rounded-lg"
          onClick={toggle}
        >
          Write a comment
        </button>
        {
          <div style={{ display: showMe ? "block" : "none" }}>
            <SimpleMDE
              value={comment.message}
              onChange={(value) =>
                setComment({
                  ...comment,
                  message: value,
                  postID: post.id, //
                })
              }
            />
            <button
              type="button"
              className="mb-4 bg-blue-600 text-white  font-semibold px-8 py-2 rounded-lg"
              onClick={createTheComment}
            >
              Save
            </button>
          </div>
        }
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  const postData = await API.graphql({
    query: listPosts,
  });
  const paths = postData.data.listPosts.items.map((post) => ({
    params: {
      id: post.id,
    },
  }));
  console.log(paths);
  return {
    paths,
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  const { id } = params;
  const postData = await API.graphql({
    query: getPost,
    variables: { id },
  });
  return {
    props: {
      post: postData.data.getPost,
    },
    revalidate: 1, // regenarate the page every second
  };
}
