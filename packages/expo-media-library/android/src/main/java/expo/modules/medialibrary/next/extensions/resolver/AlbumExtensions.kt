package expo.modules.medialibrary.next.extensions.resolver

import android.content.ContentResolver
import android.net.Uri
import android.provider.MediaStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.withContext

val EXTERNAL_CONTENT_URI: Uri = MediaStore.Files.getContentUri("external")

suspend fun ContentResolver.queryAlbumTitle(albumId: Long): String? = withContext(Dispatchers.IO) {
  val projection = arrayOf(MediaStore.Images.Media.BUCKET_DISPLAY_NAME)
  val selection = "${MediaStore.Images.Media.BUCKET_ID} = ?"
  val selectionArgs = arrayOf(albumId.toString())

  query(
    EXTERNAL_CONTENT_URI,
    projection,
    selection,
    selectionArgs,
    null
  )?.use { cursor ->
    ensureActive()
    if (cursor.moveToFirst()) {
      val albumTitle = cursor.getString(cursor.getColumnIndexOrThrow(MediaStore.Images.Media.BUCKET_DISPLAY_NAME))
      return@withContext albumTitle
    }
  }
  return@withContext null
}

fun ContentResolver.queryAlbumAssetsIds(albumId: Long): List<Long> {
  val assetIds = mutableListOf<Long>()
  val projection = arrayOf(MediaStore.Files.FileColumns._ID)
  val selection = "${MediaStore.Files.FileColumns.BUCKET_ID} = ?"
  query(
    EXTERNAL_CONTENT_URI,
    projection,
    selection,
    arrayOf(albumId.toString()),
    null
  )?.use { cursor ->
    val idColumn = cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID)
    while (cursor.moveToNext()) {
      val assetId = cursor.getLong(idColumn)
      assetIds.add(assetId)
    }
  }
  return assetIds
}

suspend fun ContentResolver.queryAlbumRelativePath(albumId: Long): String? = withContext(Dispatchers.IO) {
  val projection = arrayOf(MediaStore.Files.FileColumns.RELATIVE_PATH)
  val selection = "${MediaStore.Files.FileColumns.BUCKET_ID} = ?"
  val selectionArgs = arrayOf(albumId.toString())

  query(EXTERNAL_CONTENT_URI, projection, selection, selectionArgs, null)?.use { cursor ->
    ensureActive()
    if (cursor.moveToFirst()) {
      return@withContext cursor.getString(
        cursor.getColumnIndexOrThrow(MediaStore.Files.FileColumns.RELATIVE_PATH)
      )
    }
  }
  return@withContext null
}

fun ContentResolver.queryAlbumId(relativePath: String): Long? {
  val projection = arrayOf(MediaStore.Files.FileColumns.BUCKET_ID)
  val selection = "${MediaStore.Files.FileColumns.RELATIVE_PATH} = ?"
  val selectionArgs = arrayOf(relativePath)

  query(
    EXTERNAL_CONTENT_URI,
    projection,
    selection,
    selectionArgs,
    null
  )?.use { cursor ->
    if (cursor.moveToFirst()) {
      return cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.Files.FileColumns.BUCKET_ID))
    }
  }
  return null
}
