import pkg from 'pg';
import { nanoid } from 'nanoid';
import InvariantError from '../../exceptions/InvariantError.js';
import { mapSongs } from '../../utils/mapSongs.js';
import NotFoundError from '../../exceptions/NotFoundError.js';

const { Pool } = pkg;

class SongsServices {
  constructor() {
    this._pool = new Pool();
  }

  async postSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      values: [id, title, year, genre, performer, duration, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Gagal menambahkan musik baru");
    }

    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    // Base query untuk mengambil lagu
    let query = {
      text: 'SELECT id, title, performer FROM songs',
      values: [],
    };

    const conditions = [];
    let index = 1;

    if (title) {
      conditions.push(`title ILIKE $${index}`);
      query.values.push(`%${title}%`);
      index += 1;
    }

    if (performer) {
      conditions.push(`performer ILIKE $${index}`);
      query.values.push(`%${performer}%`);
      index += 1;
    }

    // Tambahkan WHERE jika ada filter pencarian
    if (conditions.length > 0) {
      query.text += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: "SELECT * FROM songs WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Musik tidak ditemukan");
    }

    return result.rows.map(mapSongs)[0];
  }

  async updateSongById(id, { title, year, genre, performer, duration, albumId }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "albumId" = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui musik. Id tidak ditemukan");
    }
  }

  async deleteSongById(id) {
    const query = {
      text: "DELETE FROM songs WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
    }
  }
}

export default SongsServices;