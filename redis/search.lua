-- Get string similarity
local function strsim(a, b)
  a:gsub('%s+', '')
  b:gsub('%s+', '')

  if #a == 0 or #b == 0 then
    if a == b then
      return 1
    else
      return 0
    end
  end

  if #a == 1 then
    if b:find(a) then
      return 1 / #b
    else
      return 0
    end
  elseif #b == 1 then
    if a:find(b) then
      return 1 / #a
    else
      return 0
    end
  end

  local a_bigrams = {}
  local b_bigrams = {}
  for i = 1, #a do
    if i <= 1 then
      -- Affixing
      a_bigrams[i] = '\x00' .. a:sub(i, i)
    else
      a_bigrams[i] = a:sub(i - 1, i)
    end
  end
  for i = 1, #b do
    if i <= 1 then
      b_bigrams[i] = '\x00' .. b:sub(i, i)
    else
      b_bigrams[i] = b:sub(i - 1, i)
    end
  end

  local res = {}
  for i = 1, #a + 1 do
    res[i] = {}
    for j = 1, #b + 1 do
      res[i][j] = 0
    end
  end
  res[1][1] = 0
  for i = 1, #a do
    for j = 1, #b do
      local m;
      if a_bigrams[i] == b_bigrams[j] then
        m = 1
      elseif b_bigrams[j]:find(a_bigrams[i]:sub(1, 1)) or b_bigrams[j]:find(a_bigrams[i]:sub(2, 2)) then
        m = 0.5
      else
        m = 0
      end
      res[i + 1][j + 1] = math.max(res[i][j] + m, res[i][j + 1], res[i + 1][j])
    end
  end
  local r1 = res[#a + 1][#b + 1] / math.max(#a, #b)

  local ar2 = 0
  for i = 1, #a do
    if b:find(a:sub(i, i)) then
      ar2 = ar2 + 1
    end
  end
  ar2 = ar2 / #a
  local br2 = 0
  for i = 1, #b do
    if a:find(b:sub(i, i)) then
      br2 = br2 + 1
    end
  end
  local r2 = math.max(ar2, br2)

  return r1 * 0.9 + r2 * 0.1
end

local names = redis.call('hgetall', KEYS[1])
local name_sim = {}
for i = 1, #names / 2 do
  local sim = {}
  sim[1] = strsim(names[i * 2 - 1], ARGV[1])
  sim[2] = names[i * 2]
  name_sim[i] = sim
end
table.sort(name_sim, function(a, b)
  return a[1] > b[1]
end)

local res = {}
local top = tonumber(ARGV[2])
if top == 0 then
  top = #name_sim
else
  top = math.min(top, #name_sim)
end
for i = 1, top do
  res[i] = name_sim[i][2]
end
return res
