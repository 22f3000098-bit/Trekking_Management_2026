
import json

TREK_LIST_KEY  = 'tma:treks:open'
TREK_DETAIL_KEY = 'tma:trek:{id}'
ADMIN_STATS_KEY = 'tma:admin:stats'


def _client():
    from extensions import redis_client
    return redis_client


def get_cached_treks():
    try:
        data = _client().get(TREK_LIST_KEY)
        return json.loads(data) if data else None
    except Exception:
        return None


def cache_treks(treks, ttl=300):
    try:
        _client().setex(TREK_LIST_KEY, ttl, json.dumps(treks))
    except Exception:
        pass


def get_cached_trek(trek_id):
    try:
        key  = TREK_DETAIL_KEY.format(id=trek_id)
        data = _client().get(key)
        return json.loads(data) if data else None
    except Exception:
        return None


def cache_trek(trek_id, trek_data, ttl=600):
    try:
        _client().setex(TREK_DETAIL_KEY.format(id=trek_id), ttl, json.dumps(trek_data))
    except Exception:
        pass


def invalidate_trek_cache(trek_id=None):
    try:
        rc = _client()
        rc.delete(TREK_LIST_KEY)
        rc.delete(ADMIN_STATS_KEY)
        if trek_id:
            rc.delete(TREK_DETAIL_KEY.format(id=trek_id))
    except Exception:
        pass


def get_cached_stats():
    try:
        data = _client().get(ADMIN_STATS_KEY)
        return json.loads(data) if data else None
    except Exception:
        return None


def cache_stats(stats, ttl=120):
    try:
        _client().setex(ADMIN_STATS_KEY, ttl, json.dumps(stats))
    except Exception:
        pass
