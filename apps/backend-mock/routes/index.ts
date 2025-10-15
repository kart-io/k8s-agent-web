import { defineEventHandler } from 'h3';

export default defineEventHandler(() => {
  return `
<h1>Hello Vben Admin</h1>
<h2>Mock Service is Running</h2>
<ul>
<li><a href="/api/user/info">/api/user/info</a></li>
<li><a href="/api/menu/all">/api/menu/all</a></li>
<li><a href="/api/auth/codes">/api/auth/codes</a></li>
<li><a href="/api/auth/login">/api/auth/login</a></li>
<li><a href="/api/upload">/api/upload</a></li>
<li><a href="/api/k8s/clusters/cluster-prod-01/nodes">/api/k8s/clusters/cluster-prod-01/nodes</a></li>
</ul>
`;
});
