git reset --hard
git pull origin main
echo -e "\033[0;36m"
echo "[branch] $(git rev-parse --abbrev-ref HEAD)"
git show -s --format='[commit] %h %s'
echo -e "\033[0m"
