import { useMutation } from '@tanstack/react-query';

const createTweetApi = async ({
  content,
  media,
  parent_tweet = 0,
  // is_private = false,
}: {
  content: string;
  media?: File | string;
  parent_tweet?: number;
  is_private?: boolean;
}) => {
  const formData = new FormData();
  formData.append('content', content);
  if (media) formData.append('media', media instanceof File ? media : media);
  if (parent_tweet !== 0) formData.append('parent_tweet', String(parent_tweet));
  // formData.append('is_private', String(is_private));

    // get tokennn !! 
  const csrfToken =
    document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1] ?? null;
  const accessToken = localStorage.getItem('access_token');

  const res = await fetch('http://localhost:8000/api/tweets/', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(csrfToken && { 'X-CSRFTOKEN': csrfToken }),
    },
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: "can not error" }));
    throw new Error(errData.error || "error?");
  }
  return res.json();
};

export const useCreateTweet = () => {
  return useMutation({
    mutationFn: createTweetApi,
  });
};