
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/PostList.css';

function PostList({ boardId }) {
  const [posts, setPosts] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    number: 0,
    totalPages: 0,
  });
  const [pageGroup, setPageGroup] = useState(0); // 0번째 그룹부터 시작
  const navigate = useNavigate();
  const pageSize = 10; // 한 페이지에 10개
  const pageRange = 5; // 한 그룹에 5개 페이지

  const fetchPosts = (page = 0) => {
    let url = `http://localhost:8787/api/boards/posts/paged?page=${page}&size=${pageSize}`;
    if (boardId) {
      url += `&boardId=${boardId}`;
    }

    axios.get(url)
        .then(response => {
          setPosts(response.data.content);
          setPageInfo({
            number: response.data.number,
            totalPages: response.data.totalPages,
          });
        })
        .catch(error => console.error('게시글 목록 불러오기 실패:', error));
  };

  useEffect(() => {
    fetchPosts(0);
    setPageGroup(0);
  }, [boardId]);

  const handlePostClick = (postId) => {
    navigate(`/posts/${postId}`);
  };

  const handlePageChange = (page) => {
    fetchPosts(page);
    setPageGroup(Math.floor(page / pageRange));
  };

  const renderPagination = () => {
    const startPage = pageGroup * pageRange;
    const endPage = Math.min(startPage + pageRange, pageInfo.totalPages);

    const pages = [];
    if (startPage > 0) {
      pages.push(
          <button key="prev" onClick={() => setPageGroup(pageGroup - 1)}>
            &lt;
          </button>
      );
    }

    for (let i = startPage; i < endPage; i++) {
      pages.push(
          <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={i === pageInfo.number ? 'active' : ''}
          >
            {i + 1}
          </button>
      );
    }

    if (endPage < pageInfo.totalPages) {
      pages.push(
          <button key="next" onClick={() => setPageGroup(pageGroup + 1)}>
            &gt;
          </button>
      );
    }

    return pages;
  };

  return (
      <div className="post-list">
        <table className="post-table">
          <thead>
          <tr>
            <th>작성일</th>
            <th>제목</th>
            <th>작성자</th>
          </tr>
          </thead>
          <tbody>
          {posts.length === 0 ? (
              <tr>
                <td colSpan="3" className="no-posts">게시글이 없습니다.</td>
              </tr>
          ) : (
              posts.map(post => (
                  <tr
                      key={post.id}
                      onClick={() => handlePostClick(post.id)}
                      className="post-row"
                      style={{ cursor: 'pointer' }}
                  >
                    <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                    <td>{post.title}</td>
                    <td>{post.nickname}</td>
                  </tr>
              ))
          )}
          </tbody>
        </table>

        <div className="pagination">
          {renderPagination()}
        </div>
      </div>
  );
}

export default PostList;