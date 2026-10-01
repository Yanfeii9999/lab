(function(root){
 'use strict';
 const ipToInt=ip=>{const parts=ip.split('.');if(parts.length!==4||parts.some(p=>!/^\d{1,3}$/.test(p)||Number(p)>255))throw new Error('IPv4 phải có 4 octet từ 0 đến 255.');return parts.reduce((a,p)=>a*256+Number(p),0);};
 const intToIp=n=>[24,16,8,0].map(b=>Math.floor(n/2**b)%256).join('.');
 const hostBits=hosts=>{if(!Number.isSafeInteger(hosts)||hosts<1||hosts>4294967294)throw new Error('Host phải là số nguyên từ 1 đến 4.294.967.294.');return Math.max(2,Math.ceil(Math.log2(hosts+2)));};
 function calculate(cidr,requests){const m=cidr.trim().match(/^([^/]+)\/(\d{1,2})$/);if(!m)throw new Error('Nhập mạng đúng dạng IPv4/prefix, ví dụ 192.168.1.0/24.');const ip=ipToInt(m[1]),prefix=Number(m[2]);if(prefix>30)throw new Error('Tool LAN hỗ trợ prefix /0 đến /30; không áp dụng /31, /32.');if(!requests.length)throw new Error('Cần ít nhất một mạng con.');const size=2**(32-prefix),base=Math.floor(ip/size)*size;let cursor=base;
 const sorted=requests.map((r,i)=>{const bits=hostBits(r.hosts);return{...r,name:r.name.trim()||'Mạng '+(i+1),bits,size:2**bits,original:i};}).sort((a,b)=>b.hosts-a.hosts||a.original-b.original);
 const rows=sorted.map(r=>{const network=Math.ceil(cursor/r.size)*r.size;if(network+r.size>base+size)throw new Error('Không đủ địa chỉ: mạng '+r.name+' cần khối '+r.size+' IP. Hãy giảm host hoặc mở rộng mạng gốc.');cursor=network+r.size;const p=32-r.bits;return{...r,prefix:p,network,broadcast:cursor-1,first:network+1,last:cursor-2,capacity:r.size-2,mask:intToIp(4294967296-r.size)};});
 return{base,prefix,size,rows,allocated:cursor-base,remaining:base+size-cursor,normalized:ip!==base,requested:rows.reduce((s,r)=>s+r.hosts,0),capacity:rows.reduce((s,r)=>s+r.capacity,0)};
 }
 root.VLSM={calculate,ipToInt,intToIp,hostBits};if(typeof module!=='undefined')module.exports=root.VLSM;
})(typeof window!=='undefined'?window:globalThis);
