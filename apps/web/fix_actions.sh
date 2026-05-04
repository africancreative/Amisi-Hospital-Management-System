for file in src/app/actions/*.ts; do
  perl -0777 -i -pe 's/(export async function \w+\s*\((?:[^()]++|(?R))*\))\s*\{/$1: Promise<any> {/gs' "$file"
done
