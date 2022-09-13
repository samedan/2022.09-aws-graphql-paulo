import { API, Storage, Auth } from "aws-amplify";
import Link from "next/link";
import { useState, useEffect } from "react";
import { postsByUsername } from "../src/graphql/queries";
import Moment from "moment";
import { deletePost as deletePostMutation } from "./../src/graphql/mutations";

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { username } = await Auth.currentAuthenticatedUser();
    console.log(username);
    const user = await Auth.currentAuthenticatedUser();
    console.log(user.attributes.sub);
    const userName = `${user.attributes.sub}::${user.username}`;

    const postData = await API.graphql({
      query: postsByUsername,
      // variables: { username },
      variables: { username: userName },
    });
    const { items } = postData.data.postsByUsername;
    // add Images to the Posts that have an Image
    const postsWithPossibleImages = await Promise.all(
      items.map(async (post) => {
        if (post.coverImage) {
          post.coverImage = await Storage.get(post.coverImage);
        }
        return post;
      })
    );
    setPosts(postsWithPossibleImages);

    // setPosts(postData.data.postsByUsername.items);
  }

  function showDeleteModal() {
    setShowModal(true);
  }

  async function deletePost(id) {
    await API.graphql({
      query: deletePostMutation,
      variables: { input: { id } },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });
    setShowModal(false);
    fetchPosts();
  }

  return (
    <div>
      {/* <h1 className="text-3xl font-semibold tracking-wide mt-6 mb-2">
        My Posts:{" "}
      </h1> */}
      {posts.map((post, index) => (
        <div
          key={index}
          className="py-8 px-8 max-w-xxl mx-auto bg-white rounded-xl shadow-lg space-y-2 sm:py-1 sm:flex 
          sm:items-center sm:space-y-0 sm:space-x-6 mb-2"
        >
          {post.coverImage && (
            <img
              src={post.coverImage}
              className="w-36 h-36 bg-contain bg-center rounded-full sm:mx-0 sm:shrink-0"
            />
          )}
          <div className="text-center space-y-2 sm:text-left">
            <div className="space-y-0.5">
              <p className="text-lg text-black font-semibold">{post.title}</p>
              <p className="text-slate-500 font-medium">
                Created on: {Moment(post.createdAt).format("ddd, MMM hh a")}
              </p>
            </div>
            <div className="sm:py-4 sm:flex sm-items-center sm:space-y-0 sm-space-x-1">
              <p
                className="px-4 py-1 text-sm text-purple-600 rounded-full border border-purple-200
            hover:text-white hover:bg-purple-600 hover:border-transparent
            focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
              >
                <Link href={`/edit-post/${post.id}`}>Edit post</Link>
              </p>
              <p
                className="px-4 py-1 text-sm text-purple-600 rounded-full border border-purple-200
            hover:text-white hover:bg-purple-600 hover:border-transparent
            focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
              >
                <Link href={`/posts/${post.id}`}>View post</Link>
              </p>
              <button
                className="text-sm mr-4 text-red-500 rounded-full border-2 px-4 py-1"
                onClick={() => showDeleteModal(post.id)}
              >
                Delete post
              </button>

              {/* MODAL Accept/Cancel */}
              {showModal && (
                <div
                  className="relative z-10"
                  aria-labelledby="modal-title"
                  role="dialog"
                  aria-modal="true"
                >
                  {/* <!--
    Background backdrop, show/hide based on modal state.

    Entering: "ease-out duration-300"
      From: "opacity-0"
      To: "opacity-100"
    Leaving: "ease-in duration-200"
      From: "opacity-100"
      To: "opacity-0"
  --> */}
                  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

                  <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                      {/* Modal panel, show/hide based on modal state.

        Entering: "ease-out duration-300"
          From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          To: "opacity-100 translate-y-0 sm:scale-100"
        Leaving: "ease-in duration-200"
          From: "opacity-100 translate-y-0 sm:scale-100"
          To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
       */}
                      <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                          <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                              {/* <!-- Heroicon name: outline/exclamation-triangle --> */}
                              <svg
                                className="h-6 w-6 text-red-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 10.5v3.75m-9.303 3.376C1.83 19.126 2.914 21 4.645 21h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 4.88c-.866-1.501-3.032-1.501-3.898 0L2.697 17.626zM12 17.25h.007v.008H12v-.008z"
                                />
                              </svg>
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                              <h3
                                className="text-lg font-medium leading-6 text-gray-900"
                                id="modal-title"
                              >
                                Delete post
                              </h3>
                              <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                  Are you sure you want to delete your post with
                                  the title <strong>{post.title}</strong>? All
                                  of your data will be permanently removed. This
                                  action cannot be undone.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                          <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={() => deletePost(post.id)}
                          >
                            Delete post
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={() => setShowModal(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* END Modal */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
